package com.atreyulibrary.dashboard.controller;

import com.atreyulibrary.book.dto.BookResponse;
import com.atreyulibrary.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** GET /api/v1/dashboard/recent-books — últimos 10 libros añadidos al catálogo. */
@RestController
@RequestMapping("/api/v1/dashboard/recent-books")
@Tag(name = "Dashboard", description = "Datos del panel de inicio de la biblioteca")
public class GetRecentBooksController {

    private final DashboardService service;

    /** Inyección por constructor. */
    public GetRecentBooksController(final DashboardService service) {
        this.service = service;
    }

    /**
     * Retorna los 10 libros más recientemente añadidos al catálogo.
     *
     * @return lista de hasta 10 libros ordenados por fecha de creación descendente
     */
    @GetMapping
    @Operation(
        summary = "Libros añadidos recientemente",
        description = "Retorna los últimos 10 libros añadidos al catálogo, "
            + "ordenados por fecha de creación descendente."
    )
    public ResponseEntity<List<BookResponse>> handle() {
        return ResponseEntity.ok(service.getRecentBooks());
    }
}
