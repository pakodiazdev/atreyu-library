package com.atreyulibrary.dashboard.controller;

import com.atreyulibrary.dashboard.dto.DashboardStatsResponse;
import com.atreyulibrary.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** GET /api/v1/dashboard/stats — estadísticas del catálogo para el dashboard. */
@RestController
@RequestMapping("/api/v1/dashboard/stats")
@Tag(name = "Dashboard", description = "Datos del panel de inicio de la biblioteca")
public class GetDashboardStatsController {

    private final DashboardService service;

    /** Inyección por constructor. */
    public GetDashboardStatsController(final DashboardService service) {
        this.service = service;
    }

    /**
     * Retorna el total de libros, géneros distintos y libros añadidos en el mes actual.
     *
     * @return estadísticas del catálogo
     */
    @GetMapping
    @Operation(
        summary = "Estadísticas del catálogo",
        description = "Retorna el total de libros, el número de géneros distintos y "
            + "la cantidad de libros añadidos en el mes calendario actual."
    )
    public ResponseEntity<DashboardStatsResponse> handle() {
        return ResponseEntity.ok(service.getStats());
    }
}
