# TD-17 · BIGSERIAL como PK interna + ULID como identificador externo de la API

> Revisa y reemplaza [TD-01](td-01-ulid-como-llave-primaria.md) en cuanto al rol del ULID.

## Decisión

La tabla `books` usa dos identificadores con responsabilidades distintas:

| Campo | Tipo | Rol |
|-------|------|-----|
| `id` | `BIGSERIAL` | PK interna — nunca sale de la base de datos |
| `ulid` | `VARCHAR(26)` | Identificador externo — expuesto en la API para todas las operaciones sobre un recurso (lectura y escritura) |
| `code` | `VARCHAR(3)` | Identificador de negocio — visible en la UI para búsqueda y selección |

Todos los endpoints que operan sobre un recurso concreto (`GET /books/{ulid}`, `PUT /books/{ulid}`, `DELETE /books/{ulid}`) usan el ULID como parámetro de ruta. El `code` se usa exclusivamente en la interfaz de usuario para que el usuario identifique y seleccione un libro; internamente el frontend trabaja con el ULID que recibe en el `GET /books`.

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
                                      navega a /libros/{ulid}
                                                ↓
GET /api/v1/books/{ulid}          ←   llama directamente con el ulid de la fila
DELETE /api/v1/books/{ulid}       ←   ídem para operaciones mutantes
```

## Ruta de frontend: `/libros/:ulid`

Las rutas del frontend usan el ULID directamente como parámetro (p.ej. `/libros/01HVZQR3K...`). Este esquema:

- **Simple y sin ambigüedad** — el ULID obtenido del listado se pasa directamente al router y al API; no hay extracción de `code` ni resolución en el store.
- **Sin dependencia del título** — los slugs basados en texto requieren normalización (tildes, caracteres especiales, longitud variable), lo que añade complejidad sin beneficio en una herramienta interna.
- **No enumerable** — el ULID tiene entropía de 80 bits en su componente aleatorio; no es predecible aunque se conozca el patrón.

El router de Angular define el parámetro como `:ulid`. El `code` sigue visible como badge en la UI para que el usuario identifique el libro; no se usa en la URL.

### Internacionalización (i18n) — decisión de no implementar

Las rutas no incluyen prefijo de locale (`/libros` en lugar de `/es/libros`) de forma intencional. El alcance del proyecto no requiere múltiples idiomas, y agregar el prefijo sin una estrategia completa introduciría complejidad sin valor real.

Si en el futuro se requiere i18n, Angular ofrece dos rutas de migración compatibles con la estructura actual:

- **`@angular/localize` con builds separados por locale** — cada idioma genera su propio bundle y se sirve desde una ruta base distinta (`/es/`, `/en/`). Es el enfoque oficial de Angular, óptimo para rendimiento.
- **Locale guard dinámico en el router** — un guard detecta el idioma del usuario y redirige al prefijo correspondiente en tiempo de ejecución, sin builds separados. Más flexible pero con bundle único.

Ambas estrategias son compatibles con las rutas actuales sin reescribirlas — solo se añade el segmento de locale como prefijo en la configuración del router.

## Alternativa descartada

Un solo identificador ULID como PK y campo externo es válido y más simple. Se descartó por el costo de rendimiento en PostgreSQL frente a un `BIGINT` cuando la PK nunca necesita ser visible al cliente.

## Cuándo revisar

Si el proyecto adopta sharding o replicación multi-región donde las PKs secuenciales generan colisiones, migrar la PK interna a ULID o UUID sería el paso natural.
