package com.atreyulibrary.book;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.atreyulibrary.book.dto.BookResponse;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository repository;

    @InjectMocks
    private BookService service;

    private Book sampleBook;

    @BeforeEach
    void setUp() {
        sampleBook = Book.builder()
                .id("01HWXYZ1234567890ABCDEFGH")
                .code("A01")
                .title("Cien años de soledad")
                .author("Gabriel García Márquez")
                .genre("Realismo mágico")
                .publicationYear(1967)
                .build();
    }

    // ── findAll — sin filtros ────────────────────────────────────────────────

    @Test
    void findAllWithNoFiltersPassesNullsToRepository() {
        when(repository.findByFilters(null, null, null)).thenReturn(List.of(sampleBook));

        final List<BookResponse> result = service.findAll(null, null, null);

        verify(repository).findByFilters(null, null, null);
        assertEquals(1, result.size());
    }

    @Test
    void findAllWithBlankFiltersPassesNullsToRepository() {
        when(repository.findByFilters(null, null, null)).thenReturn(List.of());

        service.findAll("  ", "", " ");

        verify(repository).findByFilters(null, null, null);
    }

    // ── findAll — mapeo de campos ────────────────────────────────────────────

    @Test
    void findAllMapsEntityFieldsToResponse() {
        when(repository.findByFilters(null, null, null)).thenReturn(List.of(sampleBook));

        final BookResponse response = service.findAll(null, null, null).get(0);

        assertEquals("A01", response.code());
        assertEquals("Cien años de soledad", response.title());
        assertEquals("Gabriel García Márquez", response.author());
        assertEquals("Realismo mágico", response.genre());
        assertEquals(1967, response.publicationYear());
    }

    @Test
    void findAllDoesNotExposeInternalId() {
        when(repository.findByFilters(null, null, null)).thenReturn(List.of(sampleBook));

        final BookResponse response = service.findAll(null, null, null).get(0);

        // BookResponse no tiene campo id — solo se expone el código de negocio
        assertEquals("A01", response.code());
    }

    @Test
    void findAllWithNullPublicationYearMapsToNull() {
        final Book bookWithoutYear = Book.builder()
                .id("01HWXYZ0000000000ABCDEFGH")
                .code("B01")
                .title("La odisea")
                .author("Homero")
                .genre("Épica")
                .publicationYear(null)
                .build();
        when(repository.findByFilters(null, null, null)).thenReturn(List.of(bookWithoutYear));

        final BookResponse response = service.findAll(null, null, null).get(0);

        assertNull(response.publicationYear());
    }

    // ── findAll — filtros delegados al repositorio ───────────────────────────

    @Test
    void findAllForwardsTitleFilterToRepository() {
        when(repository.findByFilters("quijote", null, null)).thenReturn(List.of());

        service.findAll("quijote", null, null);

        verify(repository).findByFilters("quijote", null, null);
    }

    @Test
    void findAllForwardsAuthorFilterToRepository() {
        when(repository.findByFilters(null, "orwell", null)).thenReturn(List.of());

        service.findAll(null, "orwell", null);

        verify(repository).findByFilters(null, "orwell", null);
    }

    @Test
    void findAllForwardsGenreFilterToRepository() {
        when(repository.findByFilters(null, null, "terror")).thenReturn(List.of());

        service.findAll(null, null, "terror");

        verify(repository).findByFilters(null, null, "terror");
    }

    @Test
    void findAllForwardsAllFiltersToRepository() {
        when(repository.findByFilters("1984", "orwell", "distop")).thenReturn(List.of());

        service.findAll("1984", "orwell", "distop");

        verify(repository).findByFilters("1984", "orwell", "distop");
    }

    // ── findAll — sin resultados ─────────────────────────────────────────────

    @Test
    void findAllWithNoMatchingBooksReturnsEmptyList() {
        when(repository.findByFilters("inexistente", null, null)).thenReturn(List.of());

        final List<BookResponse> result = service.findAll("inexistente", null, null);

        assertEquals(0, result.size());
    }
}
