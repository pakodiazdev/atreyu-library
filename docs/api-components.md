# Documentación de Componentes — API Atreyu Library

> Este documento define los contratos de entrada y salida de cada endpoint de la API
> de Atreyu Library. Sirve como diseño previo a la implementación (API-first) y como
> referencia para el desarrollo de frontend y backend.
>
> La documentación interactiva completa estará disponible en Swagger UI una vez
> desplegado el backend: `https://atreyu-library.pakodiaz.dev/swagger-ui.html`

---

## Modelo base — BookResponse

Objeto de respuesta común a todos los endpoints.

```json
{
  "code": "A12",
  "title": "La metamorfosis",
  "author": "Franz Kafka",
  "genre": "Ficción",
  "publicationYear": 1915,
  "createdAt": "2026-05-08T20:00:00Z",
  "updatedAt": "2026-05-08T20:00:00Z"
}
```

> El campo `id` (ULID) es interno — nunca se expone en las respuestas de la API.
> El campo `code` es el identificador visible para el usuario.

---

## GET /api/v1/books

Lista todos los libros con filtros opcionales de búsqueda.

### Parámetros de query

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `title` | `string` | No | Filtra por título (búsqueda parcial, case-insensitive) |
| `author` | `string` | No | Filtra por autor (búsqueda parcial, case-insensitive) |
| `genre` | `string` | No | Filtra por género (búsqueda parcial, case-insensitive) |

### Respuesta exitosa `200 OK`

```json
[
  {
    "code": "A12",
    "title": "La metamorfosis",
    "author": "Franz Kafka",
    "genre": "Ficción",
    "publicationYear": 1915,
    "createdAt": "2026-05-08T20:00:00Z",
    "updatedAt": "2026-05-08T20:00:00Z"
  },
  {
    "code": "B34",
    "title": "Cien años de soledad",
    "author": "Gabriel García Márquez",
    "genre": "Realismo mágico",
    "publicationYear": 1967,
    "createdAt": "2026-05-08T20:00:00Z",
    "updatedAt": "2026-05-08T20:00:00Z"
  }
]
```

---

## GET /api/v1/books/{id}

Obtiene el detalle de un libro por su ULID interno.

### Parámetros de ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string (ULID)` | Identificador técnico del libro |

### Respuesta exitosa `200 OK`

```json
{
  "code": "A12",
  "title": "La metamorfosis",
  "author": "Franz Kafka",
  "genre": "Ficción",
  "publicationYear": 1915,
  "createdAt": "2026-05-08T20:00:00Z",
  "updatedAt": "2026-05-08T20:00:00Z"
}
```

### Respuesta de error `404 Not Found`

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Book not found"
}
```

---

## POST /api/v1/books

Crea un nuevo libro. El sistema genera automáticamente el `code` y el `id`.

### Body — BookRequest

```json
{
  "title": "La metamorfosis",
  "author": "Franz Kafka",
  "genre": "Ficción",
  "publicationYear": 1915
}
```

### Validaciones

| Campo | Tipo | Requerido | Reglas |
|-------|------|-----------|--------|
| `title` | `string` | Sí | No vacío, máx. 255 caracteres |
| `author` | `string` | Sí | No vacío, máx. 255 caracteres |
| `genre` | `string` | Sí | No vacío, máx. 100 caracteres |
| `publicationYear` | `integer` | Sí | Año válido, ≤ año actual |

### Respuesta exitosa `201 Created`

```json
{
  "code": "G57",
  "title": "La metamorfosis",
  "author": "Franz Kafka",
  "genre": "Ficción",
  "publicationYear": 1915,
  "createdAt": "2026-05-08T20:00:00Z",
  "updatedAt": "2026-05-08T20:00:00Z"
}
```

### Respuesta de error `422 Unprocessable Entity`

```json
{
  "status": 422,
  "error": "Validation failed",
  "fields": {
    "title": "El título es requerido",
    "publicationYear": "El año de publicación debe ser válido"
  }
}
```

---

## PUT /api/v1/books/{id}

Actualiza los datos de un libro existente por su ULID interno.

### Parámetros de ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string (ULID)` | Identificador técnico del libro |

### Body — BookRequest

```json
{
  "title": "La metamorfosis",
  "author": "Franz Kafka",
  "genre": "Novela corta",
  "publicationYear": 1915
}
```

### Validaciones

Mismas reglas que `POST /api/v1/books`.

### Respuesta exitosa `200 OK`

```json
{
  "code": "A12",
  "title": "La metamorfosis",
  "author": "Franz Kafka",
  "genre": "Novela corta",
  "publicationYear": 1915,
  "createdAt": "2026-05-08T20:00:00Z",
  "updatedAt": "2026-05-09T10:30:00Z"
}
```

### Respuestas de error

| Código | Descripción |
|--------|-------------|
| `404 Not Found` | El libro no existe |
| `422 Unprocessable Entity` | Validación fallida |

---

## DELETE /api/v1/books/{id}

Elimina un libro por su ULID interno.

### Parámetros de ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string (ULID)` | Identificador técnico del libro |

### Respuesta exitosa `204 No Content`

Sin cuerpo de respuesta.

### Respuesta de error `404 Not Found`

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Book not found"
}
```

---

## Resumen de endpoints

| Método | Endpoint | Descripción | Respuesta |
|--------|----------|-------------|-----------|
| `GET` | `/api/v1/books` | Lista libros con filtros opcionales | `200` |
| `GET` | `/api/v1/books/{id}` | Detalle de un libro | `200` / `404` |
| `POST` | `/api/v1/books` | Crea un nuevo libro | `201` / `422` |
| `PUT` | `/api/v1/books/{id}` | Actualiza un libro | `200` / `404` / `422` |
| `DELETE` | `/api/v1/books/{id}` | Elimina un libro | `204` / `404` |
| `GET` | `/api/v1/dashboard/stats` | Estadísticas del catálogo | `200` |
| `GET` | `/api/v1/dashboard/recent-books` | Últimos 10 libros añadidos | `200` |
| `GET` | `/api/v1/dashboard/recent-activity` | Actividad reciente (crear/editar) | `200` |
| `GET` | `/api/v1/dashboard/genres` | Géneros con conteo de libros | `200` |

---

## Dashboard — Modelos de respuesta

### DashboardStatsResponse

```json
{
  "totalBooks": 42,
  "distinctGenres": 8,
  "addedThisMonth": 3
}
```

### ActivityEntry

```json
{
  "bookCode": "A12",
  "title": "La metamorfosis",
  "author": "Franz Kafka",
  "eventType": "CREATED",
  "occurredAt": "2026-05-21T10:30:00Z"
}
```

> `eventType` puede ser `CREATED` o `UPDATED`. Las eliminaciones no generan entrada (no existe log de borrado).

### GenreStats

```json
{
  "genre": "Novela",
  "count": 5
}
```

---

## GET /api/v1/dashboard/stats

Estadísticas generales del catálogo de la biblioteca.

### Respuesta exitosa `200 OK`

```json
{
  "totalBooks": 42,
  "distinctGenres": 8,
  "addedThisMonth": 3
}
```

---

## GET /api/v1/dashboard/recent-books

Los últimos 10 libros añadidos al catálogo, ordenados por fecha de creación descendente.

### Respuesta exitosa `200 OK`

Array de hasta 10 objetos `BookResponse` (ver modelo base).

---

## GET /api/v1/dashboard/recent-activity

Actividad reciente del catálogo: los últimos 15 eventos de creación o edición de libros.

### Respuesta exitosa `200 OK`

```json
[
  {
    "bookCode": "A12",
    "title": "La metamorfosis",
    "author": "Franz Kafka",
    "eventType": "UPDATED",
    "occurredAt": "2026-05-21T10:30:00Z"
  }
]
```

---

## GET /api/v1/dashboard/genres

Todos los géneros del catálogo con el número de libros de cada uno.

### Respuesta exitosa `200 OK`

```json
[
  { "genre": "Novela", "count": 5 },
  { "genre": "Fantasía", "count": 3 }
]
```
