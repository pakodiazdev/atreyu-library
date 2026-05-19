# TD-21: Pool de códigos de libros con SELECT FOR UPDATE SKIP LOCKED

## Contexto

Los libros tienen un código de negocio visible en la UI con formato `A00–Z99` (2 600 códigos posibles).
El mecanismo original (`BookCodeGenerator`) generaba códigos aleatorios y verificaba disponibilidad en
la base de datos reintentando hasta 100 veces si colisionaba. Esto presentaba varios problemas:

- Bajo concurrencia podía producir _race conditions_: dos transacciones podían elegir el mismo código
  antes de que alguna lo guardara.
- La probabilidad de colisión crecía conforme se llenaba el espacio de códigos.
- El bucle de reintento carecía de cota superior efectiva en el seeder (do-while adicional).
- Copilot señaló el bucle como potencialmente infinito.

## Decisión

Reemplazar la generación aleatoria en runtime por un **pool de códigos pre-generados en la base de datos**.

### Estructura

```sql
CREATE TABLE book_code_pool (
    code VARCHAR(3) PRIMARY KEY
);
```

Inicializado por la migración Flyway V1 (esquema inicial consolidado) con los 2 600 códigos (A00–Z99):

```sql
INSERT INTO book_code_pool (code)
SELECT chr(letter_code) || LPAD(num::text, 2, '0')
FROM generate_series(ascii('A'), ascii('Z')) AS letter_code
CROSS JOIN generate_series(0, 99) AS num
EXCEPT
SELECT code FROM books;
```

El `EXCEPT SELECT code FROM books` excluye los códigos ya asignados. Esto hace la sentencia
segura para bases de datos vacías y para escenarios de reset con datos previos (dev/qa/e2e).
En la práctica, `V1__initial_schema.sql` es una migración de esquema inicial que requiere
un reset previo de la base de datos — no está diseñada para aplicarse sobre una BD ya migrada.

### Flujo de creación de libro

Dentro de una única transacción (`@Transactional` en `BookService.create`):

1. `SELECT code FROM book_code_pool ORDER BY code LIMIT 1 FOR UPDATE SKIP LOCKED`
2. `DELETE FROM book_code_pool WHERE code = :selectedCode`
3. `INSERT INTO books ...`
4. Commit

`FOR UPDATE` garantiza que la fila queda bloqueada para la transacción actual.
`SKIP LOCKED` evita que dos transacciones concurrentes esperen la misma fila: simplemente omite
las filas ya bloqueadas y elige otra. Así dos requests simultáneas nunca obtienen el mismo código.
`ORDER BY code` garantiza selección determinista — sin él, PostgreSQL puede devolver cualquier
fila según el plan de ejecución.

### Flujo de eliminación de libro

Dentro de `@Transactional` en `BookService.deleteByUlid`:

1. Buscar libro por ULID
2. `DELETE FROM books WHERE id = :id`
3. `INSERT INTO book_code_pool (code) VALUES (:freedCode)`
4. Commit

El código queda disponible inmediatamente para nuevas creaciones, evitando que el pool se agote
con ciclos de creación/eliminación.

### Pool agotado

Si `lockAndPickCode()` devuelve vacío, se lanza `BookCodePoolEmptyException` → HTTP 503 Service Unavailable.
Cuando sea necesario ampliar la capacidad, una nueva migración extiende el espacio con `ON CONFLICT DO NOTHING`:

```sql
INSERT INTO book_code_pool (code)
SELECT chr(letter_code) || LPAD(num::text, 3, '0')
FROM generate_series(ascii('A'), ascii('Z')) AS letter_code
CROSS JOIN generate_series(0, 999) AS num
ON CONFLICT DO NOTHING;
```

## Alternativas descartadas

| Alternativa | Motivo de descarte |
|---|---|
| Random + retry (enfoque anterior) | Race condition bajo concurrencia; degradación O(n) |
| UUID como código | Pierde legibilidad en UI; rompe el contrato de negocio |
| Secuencia PostgreSQL | No genera formato `A00–Z99` de forma natural |
| Redis/cache externa | Dependencia adicional innecesaria |

## Comparativa

| Aspecto | Random + retry | Pool con SKIP LOCKED |
|---|---|---|
| Colisiones | Posibles | Imposibles |
| Reintentos | Sí (hasta 100) | No |
| Complejidad runtime | O(n) degradado | O(1) |
| Concurrencia | Race condition posible | Seguro |
| Determinismo | No | Sí |

## Consecuencias

- `BookCodeGenerator` eliminado.
- `BookService.create()` usa `BookCodePoolRepository.lockAndPickCode()` + `deleteById()`.
- `BookSeederProd` usa el mismo pool; cada llamada a `book()` invoca `lockAndPickCode()` + `deleteById()` de forma secuencial y single-threaded.
- La migración V1 (esquema consolidado) es el único punto de entrada DDL; nuevas capacidades requieren una migración incremental posterior.

## Referencia

- Issue: #056
- Implementado en: `BookCodePool`, `BookCodePoolRepository`, `BookCodePoolEmptyException`
- Migración: `V1__initial_schema.sql`
