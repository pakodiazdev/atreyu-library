# Diagramas de Secuencia — Atreyu Library

> Diagramas UML de secuencia para cada operación del sistema, generados con Mermaid.

---

## Lectura de libros

### Listar libros

```mermaid
sequenceDiagram
    actor Usuario
    participant FE as Frontend (Angular)
    participant BE as Backend (Spring Boot)
    participant DB as Base de datos (PostgreSQL)

    Usuario->>FE: Abre la biblioteca
    FE->>BE: GET /api/v1/books?title=&author=&genre=
    BE->>DB: SELECT * FROM books WHERE filtros
    DB-->>BE: List<Book>
    BE-->>FE: 200 OK — BookResponse[]
    FE-->>Usuario: Muestra lista de libros
```

### Ver detalle de un libro

```mermaid
sequenceDiagram
    actor Usuario
    participant FE as Frontend (Angular)
    participant BE as Backend (Spring Boot)
    participant DB as Base de datos (PostgreSQL)

    Usuario->>FE: Selecciona un libro de la lista
    FE->>BE: GET /api/v1/books/{id}
    BE->>DB: SELECT * FROM books WHERE id = {ulid}
    DB-->>BE: Book
    BE-->>FE: 200 OK — BookResponse
    FE-->>Usuario: Muestra detalle del libro
```

---

## Actualización de un libro

```mermaid
sequenceDiagram
    actor Usuario
    participant FE as Frontend (Angular)
    participant BE as Backend (Spring Boot)
    participant DB as Base de datos (PostgreSQL)

    Usuario->>FE: Edita datos del libro y confirma
    FE->>BE: PUT /api/v1/books/{id} — BookRequest
    BE->>DB: SELECT * FROM books WHERE id = {ulid}
    DB-->>BE: Book encontrado
    BE->>DB: UPDATE books SET ... WHERE id = {ulid}
    DB-->>BE: Book actualizado
    BE-->>FE: 200 OK — BookResponse
    FE->>FE: Invalida cache del libro y de la lista
    FE-->>Usuario: Muestra libro actualizado
```

---

## Creación de un libro

```mermaid
sequenceDiagram
    actor Usuario
    participant FE as Frontend (Angular)
    participant BE as Backend (Spring Boot)
    participant DB as Base de datos (PostgreSQL)

    Usuario->>FE: Completa formulario y confirma
    FE->>BE: POST /api/v1/books — BookRequest
    BE->>BE: Genera ULID como id interno
    BE->>BE: Genera code aleatorio (A-Z + 00-99)
    BE->>DB: INSERT INTO books (id, code, ...)
    DB-->>BE: Book guardado
    BE-->>FE: 201 Created — BookResponse
    FE->>FE: Invalida cache de la lista
    FE-->>Usuario: Redirige a lista actualizada
```

---

## Eliminación de un libro

```mermaid
sequenceDiagram
    actor Usuario
    participant FE as Frontend (Angular)
    participant BE as Backend (Spring Boot)
    participant DB as Base de datos (PostgreSQL)

    Usuario->>FE: Solicita eliminar libro (ve el code en UI)
    FE-->>Usuario: Muestra confirmación
    Usuario->>FE: Confirma eliminación
    FE->>BE: DELETE /api/v1/books/{id} — usa ULID internamente
    BE->>DB: SELECT * FROM books WHERE id = {ulid}
    DB-->>BE: Book encontrado
    BE->>DB: DELETE FROM books WHERE id = {ulid}
    DB-->>BE: Eliminado
    BE-->>FE: 204 No Content
    FE->>FE: Invalida cache de la lista
    FE-->>Usuario: Redirige a lista actualizada
```
