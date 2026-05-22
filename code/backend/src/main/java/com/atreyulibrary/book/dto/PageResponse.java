package com.atreyulibrary.book.dto;

import java.util.List;
import org.springframework.data.domain.Page;

/**
 * Envuelve un resultado paginado con metadatos de navegación.
 *
 * @param content       lista de elementos de la página actual
 * @param page          número de página (base 0)
 * @param size          tamaño de página solicitado
 * @param totalElements total de registros en el conjunto completo
 * @param totalPages    número total de páginas
 * @param hasNext       verdadero si existe página siguiente
 * @param hasPrevious   verdadero si existe página anterior
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext,
        boolean hasPrevious
) {
    /** Construye un {@code PageResponse} a partir de un {@link Page} de Spring Data. */
    public static <T> PageResponse<T> from(final Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext(),
                page.hasPrevious()
        );
    }
}
