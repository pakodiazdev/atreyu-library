package com.atreyulibrary.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Entrada de actividad reciente del catálogo.
 * Solo se registran eventos de creación y edición; las eliminaciones no generan entradas.
 *
 * @param bookCode  código de negocio del libro (A00–Z99)
 * @param title     título del libro
 * @param author    autor del libro
 * @param eventType tipo de evento: {@code CREATED} o {@code UPDATED}
 * @param occurredAt fecha/hora ISO-8601 del evento
 */
@Schema(description = "Entrada de actividad reciente del catálogo")
public record ActivityEntry(

        @Schema(description = "Código de negocio del libro", example = "A12")
        String bookCode,

        @Schema(description = "Título del libro", example = "La metamorfosis")
        String title,

        @Schema(description = "Autor del libro", example = "Franz Kafka")
        String author,

        @Schema(description = "Tipo de evento", example = "CREATED", allowableValues = {"CREATED", "UPDATED"})
        String eventType,

        @Schema(description = "Fecha y hora del evento en ISO-8601", example = "2026-05-21T10:30:00Z")
        String occurredAt
) {
}
