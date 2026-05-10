-- V2: Create books table
-- Stores the library catalogue. id is a ULID stored as VARCHAR(26).
-- code is the human-visible business identifier (A00–Z99, 2 600 combinations).

CREATE TABLE books (
    id               VARCHAR(26)  NOT NULL,
    code             VARCHAR(3)   NOT NULL,
    title            VARCHAR(255) NOT NULL,
    author           VARCHAR(255) NOT NULL,
    genre            VARCHAR(100),
    publication_year SMALLINT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_books  PRIMARY KEY (id),
    CONSTRAINT uq_books_code UNIQUE (code)
);

CREATE INDEX idx_books_author ON books (author);
CREATE INDEX idx_books_genre  ON books (genre);
