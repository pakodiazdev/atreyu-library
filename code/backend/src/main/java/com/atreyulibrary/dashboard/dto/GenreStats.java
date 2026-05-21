package com.atreyulibrary.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Género con su conteo de libros.
 *
 * @param genre nombre del género
 * @param count número de libros de ese género
 */
@Schema(description = "Género del catálogo con conteo de libros")
public record GenreStats(

        @Schema(description = "Nombre del género", example = "Novela")
        String genre,

        @Schema(description = "Número de libros de ese género", example = "5")
        long count
) {
}
