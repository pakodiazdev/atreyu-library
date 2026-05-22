package com.atreyulibrary.book.exception;

/** Lanzada cuando el pool de códigos de libros está agotado y no se puede crear un nuevo libro. */
public class BookCodePoolEmptyException extends RuntimeException {

    public BookCodePoolEmptyException() {
        super("El catálogo ha alcanzado su capacidad máxima. No hay códigos disponibles.");
    }
}
