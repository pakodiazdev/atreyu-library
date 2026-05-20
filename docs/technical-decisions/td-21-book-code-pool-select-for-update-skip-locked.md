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

1. `SELECT code FROM book_code_pool ORDER BY random() LIMIT 1 FOR UPDATE SKIP LOCKED`
2. `DELETE FROM book_code_pool WHERE code = :selectedCode`
3. `INSERT INTO books ...`
4. Commit

`FOR UPDATE` garantiza que la fila queda bloqueada para la transacción actual.
`SKIP LOCKED` evita que dos transacciones concurrentes esperen la misma fila: simplemente omite
las filas ya bloqueadas y elige otra. Así dos requests simultáneas nunca obtienen el mismo código.
`ORDER BY random()` preserva la aleatoriedad requerida por RF-04. El pool tiene máximo 2,600 filas —
un volumen pequeño que PostgreSQL ordena en sub-milisegundos — no representa degradación perceptible.

`ORDER BY random()` es compatible con `SKIP LOCKED`: cada transacción evalúa `random()` de forma
independiente. Si dos concurrentes coinciden en el primer candidato, `SKIP LOCKED` hace que la
segunda tome el siguiente en su propia secuencia aleatoria, garantizando unicidad sin sacrificar
aleatoriedad.

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
| `ORDER BY code` | Asignación secuencial — viola RF-04 (aleatoriedad requerida) |
| `sort_key` aleatorio pre-asignado | Orden determinista post-inserción: con el mismo estado de la tabla siempre se obtiene el mismo código. Predecible y con implicaciones de seguridad — un observador puede inferir el orden de los códigos restantes |
| `OFFSET` aleatorio + `LIMIT 1` | Requiere subquery COUNT o dos queries; bajo `SKIP LOCKED` el OFFSET se cuenta solo sobre filas no bloqueadas, produciendo distribución irregular. El único problema mitigable (resultado vacío cuando el offset cae fuera de rango) requeriría un retry adicional sin aportar ventaja real sobre `ORDER BY random()` para 2,600 filas |

## Comparativa de estrategias de selección aleatoria

| Aspecto | `ORDER BY random()` | `sort_key` + índice | `OFFSET` aleatorio |
|---|---|---|---|
| Aleatoriedad real en runtime | ✅ | ❌ determinista post-inserción | ✅ |
| Predecible / explotable | No | Sí | No |
| Usa índice | ❌ | ✅ | ❌ (OFFSET es O(n)) |
| Queries por create | 1 | 1 | 1 (subquery) o 2 |
| Resultado vacío posible | Solo si pool agotado | Solo si pool agotado | Pool agotado **o** offset fuera de rango |
| Retry extra requerido | No | No | Sí (offset fuera de rango) |
| Escala a 100K+ filas | No | Sí | Mejor que `ORDER BY random()` |
| Complejidad de implementación | Mínima | Migración + lógica extra | Manejo del caso vacío adicional |

> Para 2,600 filas (~8KB) el costo de `ORDER BY random()` es sub-milisegundo. Las alternativas más
> eficientes solo aportarían valor a partir de cientos de miles de filas — escenario fuera del
> alcance de este proyecto.

## Comparativa general

| Aspecto | Random + retry | Pool con `ORDER BY random()` |
|---|---|---|
| Colisiones | Posibles | Imposibles |
| Reintentos | Sí (hasta 100) | No |
| Complejidad runtime | O(n) degradado | O(n log n) trivial — 2,600 filas |
| Concurrencia | Race condition posible | Seguro |
| Aleatoriedad | Sí | Sí |

## Consecuencias

- `BookCodeGenerator` eliminado.
- `BookService.create()` usa `BookCodePoolRepository.lockAndPickCode()` + `deleteById()`.
- `BookSeederProd` usa el mismo pool; cada llamada a `book()` invoca `lockAndPickCode()` + `deleteById()` de forma secuencial y single-threaded.
- La migración V1 (esquema consolidado) es el único punto de entrada DDL; nuevas capacidades requieren una migración incremental posterior.

## Referencia

- Issue: #056 (pool inicial) — #074 (restaurar aleatoriedad con `ORDER BY random()`)
- Implementado en: `BookCodePool`, `BookCodePoolRepository`, `BookCodePoolEmptyException`
- Migración: `V1__initial_schema.sql`
