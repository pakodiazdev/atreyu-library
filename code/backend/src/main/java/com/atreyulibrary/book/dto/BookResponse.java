package com.atreyulibrary.book.dto;

import com.atreyulibrary.book.Book;

/**
 * Representación pública de un libro.
 * Usa {@code code} como identificador porque es el concepto de negocio del catálogo;
 * el ULID es un detalle de implementación de la capa de persistencia y no forma parte
 * del contrato de la API.
 *
 * @param code            identificador de negocio visible en la UI (A00–Z99)
 * @param title           título del libro
 * @param author          autor del libro
 * @param genre           género (opcional)
 * @param publicationYear año de publicación (opcional)
 */
public record BookResponse(
        String code,
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
                book.getTitle(),
                book.getAuthor(),
                book.getGenre(),
                book.getPublicationYear()
        );
    }
}
