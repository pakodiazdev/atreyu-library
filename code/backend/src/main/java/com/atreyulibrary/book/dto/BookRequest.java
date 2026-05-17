package com.atreyulibrary.book.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Datos de entrada para crear o actualizar un libro.
 * Los campos {@code title} y {@code author} son obligatorios.
 *
 * @param title           título del libro (requerido, máx. 255 caracteres)
 * @param author          autor del libro (requerido, máx. 255 caracteres)
 * @param genre           género literario (opcional, máx. 100 caracteres)
 * @param publicationYear año de publicación (opcional, 1–2100)
 * @param synopsis        sinopsis del libro (opcional)
 */
public record BookRequest(

        @NotBlank(message = "El título es obligatorio")
        @Size(max = 255, message = "El título no puede superar 255 caracteres")
        String title,

        @NotBlank(message = "El autor es obligatorio")
        @Size(max = 255, message = "El autor no puede superar 255 caracteres")
        String author,

        @Size(max = 100, message = "El género no puede superar 100 caracteres")
        String genre,

        @Min(value = 1, message = "El año de publicación debe ser mayor a 0")
        @Max(value = 2100, message = "El año de publicación no puede superar 2100")
        Integer publicationYear,

        String synopsis
) {
}
