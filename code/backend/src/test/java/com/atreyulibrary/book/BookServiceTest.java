package com.atreyulibrary.book;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.atreyulibrary.book.dto.BookRequest;
import com.atreyulibrary.book.dto.BookResponse;
import java.time.OffsetDateTime;
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

    @Mock
    private BookCodePoolRepository codePoolRepository;

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

    // ── update ───────────────────────────────────────────────────────────────

    @Test
    void updateReturnsUpdatedBook() {
        when(repository.findByUlid("01HW5XMTSC9AZAZ5YR0DR7B7GK")).thenReturn(Optional.of(sampleBook));
        when(repository.save(any(Book.class))).thenAnswer(inv -> inv.getArgument(0));

        final BookRequest request = new BookRequest(
                "El coronel no tiene quien le escriba", "García Márquez",
                "Novela corta", 1961, null);
        final BookResponse response = service.update("01HW5XMTSC9AZAZ5YR0DR7B7GK", request);

        assertEquals("El coronel no tiene quien le escriba", response.title());
        assertEquals("García Márquez", response.author());
        assertEquals("Novela corta", response.genre());
        assertEquals(1961, response.publicationYear());
    }

    @Test
    void updatePreservesCode() {
        when(repository.findByUlid("01HW5XMTSC9AZAZ5YR0DR7B7GK")).thenReturn(Optional.of(sampleBook));
        when(repository.save(any(Book.class))).thenAnswer(inv -> inv.getArgument(0));

        final BookRequest request = new BookRequest("Nuevo título", "Autor", null, null, null);
        final BookResponse response = service.update("01HW5XMTSC9AZAZ5YR0DR7B7GK", request);

        assertEquals("A01", response.code());
    }

    @Test
    void updateThrowsWhenBookNotFound() {
        when(repository.findByUlid("NONEXISTENT")).thenReturn(Optional.empty());

        final BookRequest request = new BookRequest("Título", "Autor", null, null, null);

        assertThrows(BookNotFoundException.class,
                () -> service.update("NONEXISTENT", request));
    }

    @Test
    void updateSavesBookToRepository() {
        when(repository.findByUlid("01HW5XMTSC9AZAZ5YR0DR7B7GK")).thenReturn(Optional.of(sampleBook));
        when(repository.save(any(Book.class))).thenAnswer(inv -> inv.getArgument(0));

        final BookRequest request = new BookRequest("Título", "Autor", null, null, null);
        service.update("01HW5XMTSC9AZAZ5YR0DR7B7GK", request);

        verify(repository).save(sampleBook);
    }

    @Test
    void updateSetsSynopsis() {
        when(repository.findByUlid("01HW5XMTSC9AZAZ5YR0DR7B7GK")).thenReturn(Optional.of(sampleBook));
        when(repository.save(any(Book.class))).thenAnswer(inv -> inv.getArgument(0));

        final BookRequest request = new BookRequest(
                "Título", "Autor", null, null, "Una sinopsis de prueba.");
        final BookResponse response = service.update("01HW5XMTSC9AZAZ5YR0DR7B7GK", request);

        assertEquals("Una sinopsis de prueba.", response.synopsis());
    }

    // ── deleteByUlid ─────────────────────────────────────────────────────────

    @Test
    void deleteByUlidRemovesBook() {
        when(repository.findByUlid("01HW5XMTSC9AZAZ5YR0DR7B7GK")).thenReturn(Optional.of(sampleBook));

        service.deleteByUlid("01HW5XMTSC9AZAZ5YR0DR7B7GK");

        verify(repository).delete(sampleBook);
    }

    @Test
    void deleteByUlidReturnsCodeToPool() {
        when(repository.findByUlid("01HW5XMTSC9AZAZ5YR0DR7B7GK")).thenReturn(Optional.of(sampleBook));

        service.deleteByUlid("01HW5XMTSC9AZAZ5YR0DR7B7GK");

        verify(codePoolRepository).save(argThat(entry -> "A01".equals(entry.getCode())));
    }

    @Test
    void deleteByUlidThrowsWhenBookNotFound() {
        when(repository.findByUlid("NONEXISTENT")).thenReturn(Optional.empty());

        assertThrows(BookNotFoundException.class,
                () -> service.deleteByUlid("NONEXISTENT"));
    }

    @Test
    void deleteByUlidDoesNotCallDeleteWhenBookNotFound() {
        when(repository.findByUlid("NONEXISTENT")).thenReturn(Optional.empty());

        try {
            service.deleteByUlid("NONEXISTENT");
        } catch (final BookNotFoundException ignored) {
            // excepción esperada
        }

        verify(repository, never()).delete(any());
    }

    // ── create ───────────────────────────────────────────────────────────────

    @Test
    void createReturnsSavedBookAsResponse() {
        when(codePoolRepository.lockAndPickCode()).thenReturn(Optional.of("A01"));
        when(repository.save(any(Book.class))).thenAnswer(inv -> {
            final Book book = inv.getArgument(0);
            book.setCode("A01");
            return book;
        });

        final BookRequest request = new BookRequest(
                "Cien años de soledad", "Gabriel García Márquez",
                "Realismo mágico", 1967, null);

        final BookResponse response = service.create(request);

        assertNotNull(response);
        assertEquals("A01", response.code());
        assertEquals("Cien años de soledad", response.title());
        assertEquals("Gabriel García Márquez", response.author());
    }

    @Test
    void createDelegatesToCodePool() {
        when(codePoolRepository.lockAndPickCode()).thenReturn(Optional.of("B07"));
        when(repository.save(any(Book.class))).thenAnswer(inv -> inv.getArgument(0));

        final BookRequest request = new BookRequest("1984", "George Orwell", null, null, null);
        service.create(request);

        verify(codePoolRepository).lockAndPickCode();
        verify(codePoolRepository).deleteById("B07");
    }

    @Test
    void createSavesBookWithCorrectFields() {
        when(codePoolRepository.lockAndPickCode()).thenReturn(Optional.of("C03"));
        when(repository.save(any(Book.class))).thenAnswer(inv -> inv.getArgument(0));

        final BookRequest request = new BookRequest(
                "Don Quijote", "Miguel de Cervantes", "Novela", 1605, "Primera novela moderna.");

        final BookResponse response = service.create(request);

        assertEquals("Don Quijote", response.title());
        assertEquals("Miguel de Cervantes", response.author());
        assertEquals("Novela", response.genre());
        assertEquals(1605, response.publicationYear());
    }

    @Test
    void createThrowsWhenPoolIsEmpty() {
        when(codePoolRepository.lockAndPickCode()).thenReturn(Optional.empty());

        final BookRequest request = new BookRequest("Hamlet", "Shakespeare", null, null, null);

        assertThrows(BookCodePoolEmptyException.class, () -> service.create(request));
    }

    @Test
    void createDoesNotExposeInternalId() {
        when(codePoolRepository.lockAndPickCode()).thenReturn(Optional.of("A01"));
        when(repository.save(any(Book.class))).thenAnswer(inv -> {
            final Book book = inv.getArgument(0);
            book.setCode("A01");
            return book;
        });

        final BookRequest request = new BookRequest("Hamlet", "Shakespeare", null, null, null);
        final BookResponse response = service.create(request);

        // BookResponse expone code y ulid como identificadores públicos; la PK interna (id) no se incluye
        assertNotNull(response.code());
    }

    // ── createAll ─────────────────────────────────────────────────────────────

    @Test
    void createAllReservesBulkCodesAndSavesAllBooks() {
        final List<BookRequest> requests = List.of(
            new BookRequest("Libro 1", "Autor A", null, null, null),
            new BookRequest("Libro 2", "Autor B", "Ficción", 2000, null),
            new BookRequest("Libro 3", "Autor C", null, 1990, "Sinopsis")
        );
        when(codePoolRepository.lockAndPickCodes(3)).thenReturn(List.of("M34", "B07", "Z91"));

        service.createAll(requests);

        verify(codePoolRepository).lockAndPickCodes(3);
        verify(codePoolRepository).deleteAllByCodes(List.of("M34", "B07", "Z91"));
        verify(repository).saveAll(argThat((List<Book> books) ->
            books.size() == 3
            && books.get(0).getCode().equals("M34")
            && books.get(1).getCode().equals("B07")
            && books.get(2).getCode().equals("Z91")
        ));
    }

    @Test
    void createAllThrowsWhenPoolHasFewerCodesThanRequested() {
        final List<BookRequest> requests = List.of(
            new BookRequest("L1", "A1", null, null, null),
            new BookRequest("L2", "A2", null, null, null)
        );
        when(codePoolRepository.lockAndPickCodes(2)).thenReturn(List.of("A01")); // solo 1 código

        assertThrows(BookCodePoolEmptyException.class, () -> service.createAll(requests));

        verify(repository, never()).saveAll(anyList());
    }

    @Test
    void createAllDoesNothingForEmptyList() {
        service.createAll(List.of());

        verify(codePoolRepository, never()).lockAndPickCodes(anyInt());
        verify(repository, never()).saveAll(anyList());
    }

    @Test
    void createAllWithTimestampsSetsCreatedAndUpdatedAt() {
        final OffsetDateTime ts0 = OffsetDateTime.now().minusDays(100);
        final OffsetDateTime ts1 = OffsetDateTime.now().minusDays(50);
        final List<BookRequest> requests = List.of(
            new BookRequest("Libro 1", "Autor A", null, null, null),
            new BookRequest("Libro 2", "Autor B", null, null, null)
        );
        when(codePoolRepository.lockAndPickCodes(2)).thenReturn(List.of("A01", "B02"));

        service.createAll(requests, List.of(ts0, ts1));

        verify(repository).saveAll(argThat((List<Book> books) ->
            books.size() == 2
            && ts0.equals(books.get(0).getCreatedAt())
            && ts0.equals(books.get(0).getUpdatedAt())
            && ts1.equals(books.get(1).getCreatedAt())
            && ts1.equals(books.get(1).getUpdatedAt())
        ));
    }

    @Test
    void createAllThrowsWhenCreatedAtsSizeMismatch() {
        final List<BookRequest> requests = List.of(
            new BookRequest("L1", "A1", null, null, null),
            new BookRequest("L2", "A2", null, null, null)
        );
        final List<OffsetDateTime> timestamps = List.of(OffsetDateTime.now()); // solo 1, se necesitan 2

        assertThrows(IllegalArgumentException.class,
            () -> service.createAll(requests, timestamps));

        verify(repository, never()).saveAll(anyList());
    }
}
