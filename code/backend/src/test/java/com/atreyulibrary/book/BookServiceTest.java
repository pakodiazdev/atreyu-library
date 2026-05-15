package com.atreyulibrary.book;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.atreyulibrary.book.dto.BookResponse;
import java.util.List;
import java.util.Optional;
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
                .ulid("01HW5XMTSC9AZAZ5YR0DR7B7GK")
                .code("A01")
                .title("Cien años de soledad")
                .author("Gabriel García Márquez")
                .genre("Realismo mágico")
                .publicationYear(1967)
                .build();
    }

    // ── getByCode ────────────────────────────────────────────────────────────

    @Test
    void getByCodeReturnsBookWhenFound() {
        when(repository.findByCode("A01")).thenReturn(Optional.of(sampleBook));

        final BookResponse response = service.getByCode("A01");

        assertEquals("A01", response.code());
        assertEquals("Cien años de soledad", response.title());
    }

    @Test
    void getByCodeMapsAllFieldsCorrectly() {
        when(repository.findByCode("A01")).thenReturn(Optional.of(sampleBook));

        final BookResponse response = service.getByCode("A01");

        assertEquals("A01", response.code());
        assertEquals("01HW5XMTSC9AZAZ5YR0DR7B7GK", response.ulid());
        assertEquals("Cien años de soledad", response.title());
        assertEquals("Gabriel García Márquez", response.author());
        assertEquals("Realismo mágico", response.genre());
        assertEquals(1967, response.publicationYear());
    }

    @Test
    void getByCodeMapsSynopsisCorrectly() {
        sampleBook.setSynopsis("Una saga familiar a lo largo de cien años en Macondo.");
        when(repository.findByCode("A01")).thenReturn(Optional.of(sampleBook));

        final BookResponse response = service.getByCode("A01");

        assertEquals("Una saga familiar a lo largo de cien años en Macondo.", response.synopsis());
    }

    @Test
    void getByCodeMapsSynopsisAsNullWhenNotSet() {
        when(repository.findByCode("A01")).thenReturn(Optional.of(sampleBook));

        final BookResponse response = service.getByCode("A01");

        assertNull(response.synopsis());
    }

    @Test
    void getByCodeThrowsBookNotFoundExceptionWhenNotFound() {
        when(repository.findByCode("Z99")).thenReturn(Optional.empty());

        assertThrows(BookNotFoundException.class,
                () -> service.getByCode("Z99"));
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
        assertEquals("01HW5XMTSC9AZAZ5YR0DR7B7GK", response.ulid());
        assertEquals("Cien años de soledad", response.title());
        assertEquals("Gabriel García Márquez", response.author());
        assertEquals("Realismo mágico", response.genre());
        assertEquals(1967, response.publicationYear());
    }

    @Test
    void findAllDoesNotExposeInternalBigserialId() {
        when(repository.findByFilters(null, null, null)).thenReturn(List.of(sampleBook));

        final BookResponse response = service.findAll(null, null, null).get(0);

        // BookResponse no expone la PK BIGSERIAL interna; solo code y ulid son identificadores públicos
        assertEquals("A01", response.code());
        assertEquals("01HW5XMTSC9AZAZ5YR0DR7B7GK", response.ulid());
    }

    @Test
    void findAllWithNullPublicationYearMapsToNull() {
        final Book bookWithoutYear = Book.builder()
                .ulid("01HW5XMTSC0000000000000000")
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
    void findAllMapsSynopsisToResponse() {
        sampleBook.setSynopsis("Un texto de sinopsis de prueba.");
        when(repository.findByFilters(null, null, null)).thenReturn(List.of(sampleBook));

        final BookResponse response = service.findAll(null, null, null).get(0);

        assertEquals("Un texto de sinopsis de prueba.", response.synopsis());
    }

    @Test
    void findAllMapsSynopsisAsNullWhenNotSet() {
        when(repository.findByFilters(null, null, null)).thenReturn(List.of(sampleBook));

        final BookResponse response = service.findAll(null, null, null).get(0);

        assertNull(response.synopsis());
    }

    @Test
    void findAllWithNoMatchingBooksReturnsEmptyList() {
        when(repository.findByFilters("inexistente", null, null)).thenReturn(List.of());

        final List<BookResponse> result = service.findAll("inexistente", null, null);

        assertEquals(0, result.size());
    }
}
