package com.atreyulibrary.book.controller;

import com.atreyulibrary.book.dto.BookResponse;
import com.atreyulibrary.book.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** GET /api/v1/books/{code} — detalle de un libro por su código de negocio. */
@RestController
@RequestMapping("/api/v1/books")
@Tag(name = "Books", description = "Catálogo de libros de la biblioteca")
public class GetBookByCodeController {

    private final BookService service;

    /** Inyección por constructor. */
    public GetBookByCodeController(final BookService service) {
        this.service = service;
    }

    /**
     * Retorna 200 OK con el libro, o 404 si no existe.
     *
     * @param code código de negocio del libro (ej. "A01")
     * @return libro como {@link BookResponse}
     */
    @GetMapping("/{code}")
    @Operation(
        summary = "Obtener detalle de un libro",
        description = "Retorna el detalle completo de un libro por su código de negocio (ej. A01). "
            + "Retorna 404 si no existe ningún libro con ese código."
    )
    @ApiResponse(responseCode = "200", description = "Libro encontrado")
    @ApiResponse(responseCode = "404", description = "Libro no encontrado")
    public ResponseEntity<BookResponse> handle(
            @Parameter(description = "Código de negocio del libro (ej. A01)")
            @PathVariable final String code
    ) {
        return ResponseEntity.ok(service.getByCode(code));
    }
}
