-- V1: Esquema inicial completo
-- Consolida el historial de migraciones anteriores (V1–V8).
-- Válido para entornos con reset de base de datos (dev, qa, e2e).

-- ── Libros ──────────────────────────────────────────────────────────────────
-- Tres identificadores (TD-17):
--   id   → BIGSERIAL, clave interna, nunca expuesta al cliente
--   ulid → VARCHAR(26), identificador externo para PUT/DELETE vía API
--   code → VARCHAR(3), identificador de negocio visible en la UI (A00–Z99)

CREATE TABLE books (
    id               BIGSERIAL    NOT NULL,
    ulid             VARCHAR(26)  NOT NULL,
    code             VARCHAR(3)   NOT NULL,
    title            VARCHAR(255) NOT NULL,
    author           VARCHAR(255) NOT NULL,
    genre            VARCHAR(100),
    publication_year SMALLINT,
    synopsis         TEXT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_books      PRIMARY KEY (id),
    CONSTRAINT uq_books_ulid UNIQUE (ulid),
    CONSTRAINT uq_books_code UNIQUE (code)
);

CREATE INDEX idx_books_author ON books (author);
CREATE INDEX idx_books_genre  ON books (genre);

-- Índice trigrama para búsqueda por título (LIKE insensible a mayúsculas)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_books_title_trgm ON books USING gin (LOWER(title) gin_trgm_ops);

-- ── Pool de códigos de libros ────────────────────────────────────────────────
-- Pre-genera los 2 600 códigos A00–Z99 para asignación atómica sin reintentos.
-- Estrategia: SELECT FOR UPDATE SKIP LOCKED (TD-21).

CREATE TABLE book_code_pool (
    code VARCHAR(3) PRIMARY KEY
);

INSERT INTO book_code_pool (code)
SELECT chr(letter_code) || LPAD(num::text, 2, '0')
FROM generate_series(ascii('A'), ascii('Z')) AS letter_code
CROSS JOIN generate_series(0, 99) AS num
EXCEPT
SELECT code FROM books;

-- ── Deploy checks ────────────────────────────────────────────────────────────
-- Tabla temporal de validación por entorno. Se eliminará al completar los sprints CRUD.

CREATE TABLE deploy_checks (
    id          SERIAL       NOT NULL,
    environment VARCHAR(20)  NOT NULL,
    deployed_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_deploy_checks             PRIMARY KEY (id),
    CONSTRAINT uq_deploy_checks_environment UNIQUE (environment)
);

-- ── Seeder logs ──────────────────────────────────────────────────────────────
-- Registro de seeders ejecutados para garantizar idempotencia en cada arranque.

CREATE TABLE seeder_logs (
    id            BIGSERIAL    NOT NULL,
    seeder_class  VARCHAR(255) NOT NULL,
    executed_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_seeder_logs       PRIMARY KEY (id),
    CONSTRAINT uq_seeder_logs_class UNIQUE (seeder_class)
);
