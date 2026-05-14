package com.atreyulibrary.book;

import com.atreyulibrary.book.dto.BookResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Lógica de negocio para operaciones del catálogo de libros. */
@Service
@Transactional(readOnly = true)
public class BookService {

    private final BookRepository repository;

    /** Inyección por constructor. */
    public BookService(final BookRepository repository) {
        this.repository = repository;
    }

    /**
     * Retorna el libro con el ULID dado.
     *
     * @param ulid identificador externo del libro
     * @return libro como {@link BookResponse}
     * @throws BookNotFoundException si no existe un libro con ese ULID
     */
    public BookResponse getByUlid(final String ulid) {
        return repository.findByUlid(ulid)
                .map(BookResponse::from)
                .orElseThrow(() -> new BookNotFoundException(ulid));
    }

    /**
     * Retorna todos los libros que coincidan con los filtros opcionales.
     * Los parámetros nulos o en blanco se tratan como "sin filtro".
     *
     * @param title  subcadena opcional de título
     * @param author subcadena opcional de autor
     * @param genre  subcadena opcional de género
     * @return lista de libros como {@link BookResponse}
     */
    public List<BookResponse> findAll(
            final String title,
            final String author,
            final String genre
    ) {
        final String normalizedTitle = blankToNull(title);
        final String normalizedAuthor = blankToNull(author);
        final String normalizedGenre = blankToNull(genre);
        return repository
                .findByFilters(normalizedTitle, normalizedAuthor, normalizedGenre)
                .stream()
                .map(BookResponse::from)
                .toList();
    }

    private String blankToNull(final String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value;
    }
}
