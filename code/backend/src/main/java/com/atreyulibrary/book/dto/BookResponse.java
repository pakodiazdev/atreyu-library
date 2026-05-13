package com.atreyulibrary.book.dto;

import com.atreyulibrary.book.Book;

/**
 * Representación pública de un libro.
 * Expone tres identificadores con roles distintos (TD-17):
 * <ul>
 *   <li>{@code code} — identificador de negocio visible en la UI (A00–Z99)</li>
 *   <li>{@code ulid} — identificador externo para operaciones PUT/DELETE vía API;
 *       no enumerable y ordenado por tiempo</li>
 * </ul>
 * La clave primaria interna ({@code id BIGSERIAL}) no forma parte del contrato de la API.
 *
 * @param code            identificador de negocio visible en la UI (A00–Z99)
 * @param ulid            identificador externo no enumerable (ULID) para PUT/DELETE
 * @param title           título del libro
 * @param author          autor del libro
 * @param genre           género (opcional)
 * @param publicationYear año de publicación (opcional)
 */
public record BookResponse(
        String code,
        String ulid,
        String title,
        String author,
        String genre,
        Integer publicationYear
) {

    /**
     * Crea un {@code BookResponse} a partir de una entidad {@link Book}.
     *
     * @param book entidad de origen
     * @return nuevo record de respuesta
     */
    public static BookResponse from(final Book book) {
        return new BookResponse(
                book.getCode(),
                book.getUlid(),
                book.getTitle(),
                book.getAuthor(),
                book.getGenre(),
                book.getPublicationYear()
        );
    }
}
