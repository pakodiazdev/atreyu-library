package com.atreyulibrary.dashboard.controller;

import com.atreyulibrary.dashboard.dto.GenreStats;
import com.atreyulibrary.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** GET /api/v1/dashboard/genres — géneros del catálogo con conteo de libros. */
@RestController
@RequestMapping("/api/v1/dashboard/genres")
@Tag(name = "Dashboard", description = "Datos del panel de inicio de la biblioteca")
public class GetGenresController {

    private final DashboardService service;

    /** Inyección por constructor. */
    public GetGenresController(final DashboardService service) {
        this.service = service;
    }

    /**
     * Retorna todos los géneros registrados en el catálogo con su conteo de libros.
     *
     * @return lista de géneros ordenados por conteo descendente
     */
    @GetMapping
    @Operation(
        summary = "Géneros del catálogo",
        description = "Retorna todos los géneros distintos del catálogo "
            + "con el número de libros de cada uno, ordenados por popularidad."
    )
    public ResponseEntity<List<GenreStats>> handle() {
        return ResponseEntity.ok(service.getGenreStats());
    }
}
