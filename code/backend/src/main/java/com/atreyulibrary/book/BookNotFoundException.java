package com.atreyulibrary.book;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** Lanzada cuando no existe un libro con el ULID solicitado. */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class BookNotFoundException extends RuntimeException {

    public BookNotFoundException(final String ulid) {
        super("Libro no encontrado: " + ulid);
    }
}
