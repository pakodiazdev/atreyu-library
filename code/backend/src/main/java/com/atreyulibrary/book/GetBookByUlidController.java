package com.atreyulibrary.book;

import com.atreyulibrary.book.dto.BookResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** GET /api/v1/books/{ulid} — detalle de un libro por su ULID. */
@RestController
@RequestMapping("/api/v1/books")
@Tag(name = "Books", description = "Catálogo de libros de la biblioteca")
public class GetBookByUlidController {

    private final BookService service;

    /** Inyección por constructor. */
    public GetBookByUlidController(final BookService service) {
        this.service = service;
    }

    /**
     * Retorna 200 OK con el libro, o 404 si no existe.
     *
     * @param ulid identificador externo del libro
     * @return libro como {@link BookResponse}
     */
    @GetMapping("/{ulid}")
    @Operation(
        summary = "Obtener detalle de un libro",
        description = "Retorna el detalle completo de un libro por su ULID. "
            + "Retorna 404 si no existe ningún libro con ese identificador."
    )
    @ApiResponse(responseCode = "200", description = "Libro encontrado")
    @ApiResponse(responseCode = "404", description = "Libro no encontrado")
    public ResponseEntity<BookResponse> invoke(
            @Parameter(description = "ULID del libro")
            @PathVariable final String ulid
    ) {
        return ResponseEntity.ok(service.getByUlid(ulid));
    }
}
