package com.atreyulibrary.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Estadísticas de alto nivel del catálogo para el dashboard de inicio.
 *
 * @param totalBooks     total de libros en el catálogo
 * @param distinctGenres número de géneros distintos registrados
 * @param addedThisMonth libros añadidos en el mes calendario actual
 */
@Schema(description = "Estadísticas del catálogo de la biblioteca")
public record DashboardStatsResponse(

        @Schema(description = "Total de libros en el catálogo", example = "42")
        long totalBooks,

        @Schema(description = "Número de géneros distintos", example = "8")
        long distinctGenres,

        @Schema(description = "Libros añadidos en el mes actual", example = "3")
        long addedThisMonth
) {
}
