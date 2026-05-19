package com.atreyulibrary.book;

/** Lanzada cuando no existe un libro con el identificador solicitado (ULID o code). */
public class BookNotFoundException extends RuntimeException {

    public BookNotFoundException(final String identifier) {
        super("Libro no encontrado: " + identifier);
    }
}
