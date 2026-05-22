package com.atreyulibrary.health;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** GET /api/v1/health — liveness probe para el splash screen del frontend. */
@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health", description = "Liveness probe del backend")
public class HealthController {

    @GetMapping
    @Operation(summary = "Liveness probe", description = "Retorna UP si el servidor está listo.")
    public ResponseEntity<Map<String, String>> handle() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
