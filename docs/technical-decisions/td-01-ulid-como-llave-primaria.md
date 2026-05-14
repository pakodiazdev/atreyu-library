# TD-01 · ULID como llave primaria, código de negocio como identificador secundario

> **Nota:** Esta decisión fue revisada en [TD-17](td-17-bigserial-pk-ulid-identificador-externo.md).

## Decisión

El modelo `Book` utiliza **ULID** como llave primaria técnica. El campo `code` (formato A-Z + 00-99,
ej. `A12`, `B34`) es un **identificador secundario de negocio**, visible en la UI y útil para
búsqueda, pero nunca expuesto como PK en operaciones internas.

## Justificación

El algoritmo de identificación definido en los requerimientos genera códigos del tipo `A12`:
una letra (A-Z) seguida de dos dígitos (00-99), lo que produce un universo de únicamente
**2,600 combinaciones posibles**.

Usar este código como llave primaria introduciría un límite arquitectónico directo:
la base de datos no podría almacenar más de 2,600 libros sin violar la unicidad. Esta es
una **restricción de negocio** que no debería condicionar la arquitectura técnica.

La separación de responsabilidades es clara:

| Campo | Rol | Visibilidad |
|-------|-----|-------------|
| `id` (ULID) | Identificador técnico, PK real | Interno — nunca expuesto en UI |
| `code` | Identificador de negocio, código de búsqueda | UI, búsqueda, referencia humana |

## Impacto en escalabilidad

El sistema puede crecer sin límite de registros independientemente del formato del `code`.
Si en el futuro el cliente decide cambiar el algoritmo de generación (por ejemplo, ampliar
a tres dígitos o agregar más letras), **el cambio es únicamente en la lógica de generación
del código** — la arquitectura de base de datos, los endpoints y la lógica interna no se
ven afectados.

El ULID como PK garantiza:
- Unicidad global sin depender de secuencias de base de datos
- Ordenamiento cronológico implícito
- Sin colisiones en escenarios distribuidos
