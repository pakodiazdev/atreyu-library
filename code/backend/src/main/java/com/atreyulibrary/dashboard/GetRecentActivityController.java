package com.atreyulibrary.dashboard;

import com.atreyulibrary.dashboard.dto.ActivityEntry;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** GET /api/v1/dashboard/recent-activity — actividad reciente del catálogo. */
@RestController
@RequestMapping("/api/v1/dashboard/recent-activity")
@Tag(name = "Dashboard", description = "Datos del panel de inicio de la biblioteca")
public class GetRecentActivityController {

    private final DashboardService service;

    /** Inyección por constructor. */
    public GetRecentActivityController(final DashboardService service) {
        this.service = service;
    }

    /**
     * Retorna los eventos de actividad reciente del catálogo.
     * Solo registra creaciones ({@code CREATED}) y ediciones ({@code UPDATED}).
     * Las eliminaciones no generan entradas porque no existe log de borrado.
     *
     * @return entradas de actividad ordenadas por el evento más reciente primero
     */
    @GetMapping
    @Operation(
        summary = "Actividad reciente del catálogo",
        description = "Retorna los últimos eventos de creación y edición de libros. "
            + "Las eliminaciones no se registran (no existe log de borrado)."
    )
    public ResponseEntity<List<ActivityEntry>> handle() {
        return ResponseEntity.ok(service.getRecentActivity());
    }
}
