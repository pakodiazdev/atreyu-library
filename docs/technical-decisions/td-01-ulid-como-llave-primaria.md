# TD-01 · ULID como llave primaria, código de negocio como identificador secundario

> ⚠️ **DEPRECATED — reemplazada por [TD-17](td-17-bigserial-pk-ulid-identificador-externo.md)**
>
> Esta decisión fue la primera aproximación al problema de identificación. Se conserva como
> registro histórico del razonamiento original y de cómo evolucionó la decisión.

---

## Historia de esta decisión

Al inicio del proyecto, el problema a resolver era claro: el `code` de negocio (formato `A12`)
tiene solo 2 600 combinaciones posibles y no podía ser la PK. La solución inicial fue usar
**ULID como llave primaria directa** — un identificador técnico globalmente único, ordenable
y sin los problemas de secuencialidad de un `BIGINT`.

Esa decisión fue correcta en su contexto. El problema surgió al diseñar los endpoints REST:
exponer el ULID como parámetro de ruta (`/books/{ulid}`) significaba que la **PK interna
de la base de datos quedaba expuesta en la API pública**. En PostgreSQL, usar `VARCHAR(26)`
como PK tiene un costo real frente a `BIGINT`: índices más grandes, JOINs más lentos y mayor
uso de disco. Forzar al mismo campo a cumplir dos roles — PK interna y referencia externa —
es una decisión que cobra deuda con el tiempo.

La revisión en **TD-17** separó las responsabilidades en tres identificadores distintos:
`BIGSERIAL` como PK interna (nunca expuesta), `ULID` como identificador externo de la API,
y `code` como identificador de negocio visible en UI. El razonamiento original de TD-01
sobre por qué `code` no puede ser PK sigue siendo válido — TD-17 lo extiende, no lo contradice.

---

## Decisión original *(archivada)*

El modelo `Book` utiliza **ULID** como llave primaria técnica. El campo `code` (formato A-Z + 00-99,
ej. `A12`, `B34`) es un **identificador secundario de negocio**, visible en la UI y útil para
búsqueda, pero nunca expuesto como PK en operaciones internas.

## Justificación original *(archivada)*

El algoritmo de identificación definido en los requerimientos genera códigos del tipo `A12`:
una letra (A-Z) seguida de dos dígitos (00-99), lo que produce un universo de únicamente
**2,600 combinaciones posibles**.

Usar este código como llave primaria introduciría un límite arquitectónico directo:
la base de datos no podría almacenar más de 2,600 libros sin violar la unicidad. Esta es
una **restricción de negocio** que no debería condicionar la arquitectura técnica.

| Campo | Rol | Visibilidad |
|-------|-----|-------------|
| `id` (ULID) | Identificador técnico, PK real | Interno — nunca expuesto en UI |
| `code` | Identificador de negocio, código de búsqueda | UI, búsqueda, referencia humana |

## Por qué se superó esta decisión

ULID como PK (`VARCHAR(26)`) tiene costo en PostgreSQL: índices más grandes y JOINs más
lentos que `BIGINT`. Al necesitar exponer un identificador externo en la API de todas formas,
no había razón para que ese campo fuera también la PK interna. TD-17 introduce `BIGSERIAL`
como PK (rendimiento óptimo en PostgreSQL) y mantiene el ULID exclusivamente como
identificador externo — sin costo de PK, con todos los beneficios de identificación pública.
