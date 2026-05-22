package com.atreyulibrary.book;

import com.atreyulibrary.book.dto.BookResponse;
import com.atreyulibrary.book.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** GET /api/v1/books — catálogo paginado con filtros opcionales. */
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
     * Retorna 200 OK con una página de libros que coincidan con los filtros.
     * Los filtros son parciales y case-insensitive. El orden siempre es code ASC.
     *
     * @param title  subcadena opcional de título
     * @param author subcadena opcional de autor
     * @param genre  subcadena opcional de género
     * @param page   página a retornar (base 0; default 0)
     * @param size   elementos por página (default 10; máximo 100 en servicio)
     * @return página de libros como {@link PageResponse}
     */
    @GetMapping
    @Operation(
        summary = "Listar libros paginados",
        description = "Retorna una página del catálogo. Soporta filtros opcionales parciales "
            + "e insensibles a mayúsculas por título, autor y género."
    )
    public ResponseEntity<PageResponse<BookResponse>> handle(
            @Parameter(description = "Filtro parcial de título")
            @RequestParam(required = false) final String title,
            @Parameter(description = "Filtro parcial de autor")
            @RequestParam(required = false) final String author,
            @Parameter(description = "Filtro parcial de género")
            @RequestParam(required = false) final String genre,
            @Parameter(description = "Número de página (base 0)")
            @RequestParam(defaultValue = "0") final int page,
            @Parameter(description = "Elementos por página (máximo 100)")
            @RequestParam(defaultValue = "10") final int size
    ) {
        return ResponseEntity.ok(service.findAll(title, author, genre, page, size));
    }
}
