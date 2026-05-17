package com.atreyulibrary.book;

import com.atreyulibrary.book.dto.BookRequest;
import com.atreyulibrary.book.dto.BookResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** POST /api/v1/books — registra un nuevo libro en el catálogo. */
@RestController
@RequestMapping("/api/v1/books")
@Tag(name = "Books", description = "Catálogo de libros de la biblioteca")
public class CreateBookController {

    private final BookService service;

    /** Inyección por constructor. */
    public CreateBookController(final BookService service) {
        this.service = service;
    }

    /**
     * Retorna 201 Created con el libro creado, incluyendo su código de negocio generado.
     * Retorna 422 si el body no pasa la validación.
     *
     * @param request datos del nuevo libro
     * @return libro creado como {@link BookResponse}
     */
    @PostMapping
    @Operation(
        summary = "Crear libro",
        description = "Registra un nuevo libro. Genera automáticamente el ULID externo "
            + "y el código de negocio (A00–Z99)."
    )
    @ApiResponse(responseCode = "201", description = "Libro creado")
    @ApiResponse(responseCode = "422", description = "Datos de entrada inválidos")
    public ResponseEntity<BookResponse> handle(
            @Valid @RequestBody final BookRequest request
    ) {
        final BookResponse created = service.create(request);
        final URI location = URI.create("/api/v1/books/" + created.code());
        return ResponseEntity.created(location).body(created);
    }
}
