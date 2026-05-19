package com.atreyulibrary.book;

/** Lanzada cuando no existe un libro con el ULID solicitado. */
public class BookNotFoundException extends RuntimeException {

    public BookNotFoundException(final String ulid) {
        super("Libro no encontrado: " + ulid);
    }
}
