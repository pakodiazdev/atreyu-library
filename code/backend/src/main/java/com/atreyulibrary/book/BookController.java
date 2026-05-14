package com.atreyulibrary.book;

import com.atreyulibrary.book.dto.BookResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints REST para el catálogo de libros. */
@RestController
@RequestMapping("/api/v1/books")
@Tag(name = "Books", description = "Catálogo de libros de la biblioteca")
public class BookController {

    private final BookService service;

    /** Inyección por constructor. */
    public BookController(final BookService service) {
        this.service = service;
    }

    /**
     * Retorna todos los libros, opcionalmente filtrados por título, autor y/o género.
     * Los filtros son parciales y case-insensitive.
     *
     * @param title  filtro parcial de título (opcional)
     * @param author filtro parcial de autor (opcional)
     * @param genre  filtro parcial de género (opcional)
     * @return 200 OK con lista de libros
     */
    /**
     * Retorna el detalle de un libro por su ULID.
     *
     * @param ulid identificador externo del libro
     * @return 200 OK con el libro, o 404 si no existe
     */
    @GetMapping("/{ulid}")
    @Operation(
        summary = "Obtener detalle de un libro",
        description = "Retorna el detalle completo de un libro por su ULID. "
            + "Retorna 404 si no existe ningún libro con ese identificador."
    )
    public ResponseEntity<BookResponse> getByUlid(
            @Parameter(description = "ULID del libro")
            @PathVariable final String ulid
    ) {
        return ResponseEntity.ok(service.getByUlid(ulid));
    }

    @GetMapping
    @Operation(
        summary = "Listar libros",
        description = "Retorna todos los libros. Soporta filtros opcionales parciales "
            + "e insensibles a mayúsculas por título, autor y género."
    )
    public ResponseEntity<List<BookResponse>> list(
            @Parameter(description = "Filtro parcial de título")
            @RequestParam(required = false) final String title,
            @Parameter(description = "Filtro parcial de autor")
            @RequestParam(required = false) final String author,
            @Parameter(description = "Filtro parcial de género")
            @RequestParam(required = false) final String genre
    ) {
        return ResponseEntity.ok(service.findAll(title, author, genre));
    }
}
