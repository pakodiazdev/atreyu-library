package com.atreyulibrary.book.controller;

import com.atreyulibrary.book.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** DELETE /api/v1/books/{ulid} — elimina un libro del catálogo. */
@RestController
@RequestMapping("/api/v1/books")
@Tag(name = "Books", description = "Catálogo de libros de la biblioteca")
public class DeleteBookController {

    private final BookService service;

    /** Inyección por constructor. */
    public DeleteBookController(final BookService service) {
        this.service = service;
    }

    /**
     * Retorna 204 No Content si el libro fue eliminado, 404 si no existe.
     *
     * @param ulid identificador externo del libro
     * @return respuesta vacía
     */
    @DeleteMapping("/{ulid}")
    @Operation(
        summary = "Eliminar libro",
        description = "Elimina permanentemente un libro del catálogo por su ULID."
    )
    @ApiResponse(responseCode = "204", description = "Libro eliminado correctamente")
    @ApiResponse(responseCode = "404", description = "Libro no encontrado")
    public ResponseEntity<Void> handle(
            @Parameter(description = "ULID del libro (identificador externo)")
            @PathVariable final String ulid
    ) {
        service.deleteByUlid(ulid);
        return ResponseEntity.noContent().build();
    }
}
