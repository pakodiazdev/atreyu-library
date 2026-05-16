package com.atreyulibrary.book.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Datos de entrada para crear o actualizar un libro.
 * Los campos {@code title} y {@code author} son obligatorios.
 *
 * @param title           título del libro (requerido)
 * @param author          autor del libro (requerido)
 * @param genre           género literario (opcional, máx. 100 caracteres)
 * @param publicationYear año de publicación (opcional, 0–2100)
 * @param synopsis        sinopsis del libro (opcional)
 */
public record BookRequest(

        @NotBlank(message = "El título es obligatorio")
        String title,

        @NotBlank(message = "El autor es obligatorio")
        String author,

        @Size(max = 100, message = "El género no puede superar los 100 caracteres")
        String genre,

        @Min(value = 0, message = "El año de publicación no puede ser negativo")
        @Max(value = 2100, message = "El año de publicación no puede superar 2100")
        Integer publicationYear,

        String synopsis
) {
}
