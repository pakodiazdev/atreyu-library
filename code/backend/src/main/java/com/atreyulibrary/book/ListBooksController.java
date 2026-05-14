package com.atreyulibrary.book;

import com.atreyulibrary.book.dto.BookResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** GET /api/v1/books — listado de libros con filtros opcionales. */
@RestController
@RequestMapping("/api/v1/books")
@Tag(name = "Books", description = "Catálogo de libros de la biblioteca")
public class ListBooksController {

    private final BookService service;

    /** Inyección por constructor. */
    public ListBooksController(final BookService service) {
        this.service = service;
    }

    /**
     * Retorna 200 OK con la lista de libros que coincidan con los filtros.
     * Los filtros son parciales y case-insensitive. Sin filtros, retorna todos.
     *
     * @param title  subcadena opcional de título
     * @param author subcadena opcional de autor
     * @param genre  subcadena opcional de género
     * @return lista de libros como {@link BookResponse}
     */
    @GetMapping
    @Operation(
        summary = "Listar libros",
        description = "Retorna todos los libros. Soporta filtros opcionales parciales "
            + "e insensibles a mayúsculas por título, autor y género."
    )
    public ResponseEntity<List<BookResponse>> handle(
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
