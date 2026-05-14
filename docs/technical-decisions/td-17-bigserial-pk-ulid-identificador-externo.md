# TD-17 · BIGSERIAL como PK interna + ULID como identificador externo de la API

> Revisa y reemplaza [TD-01](td-01-ulid-como-llave-primaria.md) en cuanto al rol del ULID.

## Decisión

La tabla `books` usa dos identificadores con responsabilidades distintas:

| Campo | Tipo | Rol |
|-------|------|-----|
| `id` | `BIGSERIAL` | PK interna — nunca sale de la base de datos |
| `ulid` | `VARCHAR(26)` | Identificador externo — expuesto en la API para operaciones mutantes |
| `code` | `VARCHAR(3)` | Identificador de negocio — visible en la UI para búsqueda y selección |

Los endpoints de escritura (`PUT /books/{ulid}`, `DELETE /books/{ulid}`) usan el ULID como parámetro de ruta. El `code` se usa exclusivamente en la interfaz de usuario para que el usuario identifique y seleccione un libro; internamente el frontend trabaja con el ULID que recibe en el `GET /books`.

## Justificación

**¿Por qué no solo `code`?**
El `code` (A00–Z99) tiene 2 600 combinaciones — completamente enumerable. Exponer un identificador así en operaciones de escritura permitiría escanear y mutar el catálogo completo con un bucle trivial.

**¿Por qué no ULID como PK?**
Los ULIDs como PK (`VARCHAR(26)`) tienen un costo real en PostgreSQL: índices más grandes, JOINs más lentos y mayor uso de disco frente a un `BIGINT`. Si el identificador externo y la PK interna cumplen roles distintos, no hay razón para forzar el mismo campo a hacer los dos trabajos.

**¿Por qué no UUID como identificador externo?**
El ULID es ordenable por tiempo de inserción, lo que permite paginación eficiente con cursores en el futuro (`WHERE ulid > :cursor ORDER BY ulid`). Un UUID v4 aleatorio no ofrece esta propiedad.

**¿Por qué no entero autoincremental como identificador externo?**
Un `id` secuencial expuesto en la API revela el volumen del catálogo (`/books/1`, `/books/2`... `/books/847`) y permite enumerar todos los recursos con un bucle. El ULID no es predecible ni revela información sobre el número total de registros.

## Flujo de referencia

```
API REST                              Frontend (Angular)
────────────────────────────────      ─────────────────────────────────────
GET /api/v1/books                 →   lista: [{ ulid, code, title, ... }]
                                                ↓
                                      usuario ve "A04 — Don Quijote..."
                                                ↓
                                      navega a /libros/A04-don-quijote-de-la-mancha
                                                ↓
                                      Angular extrae code del slug → "A04"
                                      busca ulid en el store local
                                                ↓
GET /api/v1/books/{ulid}          ←   llama con el ulid del libro seleccionado
DELETE /api/v1/books/{ulid}       ←   ídem para operaciones mutantes
```

## Ruta de frontend: `/libros/{code}-{titulo-en-slug}`

Las rutas del frontend siguen el patrón `/{code}-{titulo-slugificado}` (p.ej. `/libros/A04-don-quijote-de-la-mancha`). Este esquema:

- **No es enumerable por sí solo** en la práctica — el `code` tiene 2 600 combinaciones pero el slug incluye el título, y una URL sin título válido no resuelve nada útil.
- **Es compatible con SEO y marcadores** — la URL es legible y estable; si el título cambia, la URL "vieja" sigue funcionando porque `code` no varía.
- **Desacopla la URL de la API** — el `code` en la URL es solo para que Angular recupere el `ulid` del store; la API nunca recibe el `code` como parámetro de ruta.

El router de Angular define el parámetro como `:slug`; el componente extrae el `code` con `slug.split('-')[0]`.

## Alternativa descartada

Un solo identificador ULID como PK y campo externo es válido y más simple. Se descartó por el costo de rendimiento en PostgreSQL frente a un `BIGINT` cuando la PK nunca necesita ser visible al cliente.

## Cuándo revisar

Si el proyecto adopta sharding o replicación multi-región donde las PKs secuenciales generan colisiones, migrar la PK interna a ULID o UUID sería el paso natural.
