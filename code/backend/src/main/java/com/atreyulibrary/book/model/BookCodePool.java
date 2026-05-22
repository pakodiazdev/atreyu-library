package com.atreyulibrary.book.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Entrada del pool de códigos de negocio disponibles para asignar a nuevos libros. */
@Entity
@Table(name = "book_code_pool")
public class BookCodePool {

    @Id
    @Column(name = "code", length = 3, nullable = false)
    private String code;

    protected BookCodePool() { }

    BookCodePool(final String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
