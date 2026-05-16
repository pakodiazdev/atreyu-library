package com.atreyulibrary.book;

import com.atreyulibrary.book.dto.BookRequest;
import com.atreyulibrary.book.dto.BookResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** PUT /api/v1/books/{ulid} — actualiza los datos de un libro existente. */
@RestController
@RequestMapping("/api/v1/books")
@Tag(name = "Books", description = "Catálogo de libros de la biblioteca")
public class UpdateBookController {

    private final BookService service;

    /** Inyección por constructor. */
    public UpdateBookController(final BookService service) {
        this.service = service;
    }

    /**
     * Retorna 200 OK con el libro actualizado, 404 si no existe o
     * 422 si la validación falla. El {@code code} del libro es inmutable.
     *
     * @param ulid    identificador externo del libro
     * @param request datos de actualización validados
     * @return libro actualizado como {@link BookResponse}
     */
    @PutMapping("/{ulid}")
    @Operation(
        summary = "Actualizar libro",
        description = "Actualiza título, autor, género, año y sinopsis de un libro por su ULID. "
            + "El código de negocio (code) es inmutable y no cambia al editar."
    )
    @ApiResponse(responseCode = "200", description = "Libro actualizado correctamente")
    @ApiResponse(responseCode = "404", description = "Libro no encontrado")
    @ApiResponse(responseCode = "422", description = "Datos de entrada inválidos")
    public ResponseEntity<BookResponse> handle(
            @Parameter(description = "ULID del libro (identificador externo)")
            @PathVariable final String ulid,
            @Valid @RequestBody final BookRequest request
    ) {
        return ResponseEntity.ok(service.update(ulid, request));
    }
}
