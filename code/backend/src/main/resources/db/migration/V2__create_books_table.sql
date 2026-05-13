-- V2: Create books table
-- Identificadores de tres niveles (TD-17):
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
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_books      PRIMARY KEY (id),
    CONSTRAINT uq_books_ulid UNIQUE (ulid),
    CONSTRAINT uq_books_code UNIQUE (code)
);

CREATE INDEX idx_books_author ON books (author);
CREATE INDEX idx_books_genre  ON books (genre);
