package com.atreyulibrary.book;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.atreyulibrary.book.dto.BookRequest;
import com.atreyulibrary.book.dto.BookResponse;
import com.atreyulibrary.book.dto.PageResponse;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.JdbcTemplate;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository repository;

    @Mock
    private BookCodePoolRepository codePoolRepository;

    @Mock
    private JdbcTemplate jdbcTemplate;

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
        when(repository.findByFilters(eq(null), eq(null), eq(null), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sampleBook)));

        final PageResponse<BookResponse> result = service.findAll(null, null, null, 0, 20);

        verify(repository).findByFilters(eq(null), eq(null), eq(null), any(Pageable.class));
        assertEquals(1, result.content().size());
        assertEquals(1L, result.totalElements());
    }

    @Test
    void findAllWithBlankFiltersPassesNullsToRepository() {
        when(repository.findByFilters(eq(null), eq(null), eq(null), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        service.findAll("  ", "", " ", 0, 20);

        verify(repository).findByFilters(eq(null), eq(null), eq(null), any(Pageable.class));
    }

    // ── findAll — mapeo de campos ────────────────────────────────────────────

    @Test
    void findAllMapsEntityFieldsToResponse() {
        when(repository.findByFilters(eq(null), eq(null), eq(null), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sampleBook)));

        final BookResponse response = service.findAll(null, null, null, 0, 20).content().get(0);

        assertEquals("A01", response.code());
        assertEquals("01HW5XMTSC9AZAZ5YR0DR7B7GK", response.ulid());
        assertEquals("Cien años de soledad", response.title());
        assertEquals("Gabriel García Márquez", response.author());
        assertEquals("Realismo mágico", response.genre());
        assertEquals(1967, response.publicationYear());
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
        when(repository.findByFilters(eq(null), eq(null), eq(null), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(bookWithoutYear)));

        final BookResponse response = service.findAll(null, null, null, 0, 20).content().get(0);

        assertNull(response.publicationYear());
    }

    // ── findAll — filtros delegados al repositorio ───────────────────────────

    @Test
    void findAllForwardsTitleFilterToRepository() {
        when(repository.findByFilters(eq("quijote"), eq(null), eq(null), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        service.findAll("quijote", null, null, 0, 20);

        verify(repository).findByFilters(eq("quijote"), eq(null), eq(null), any(Pageable.class));
    }

    @Test
    void findAllForwardsAuthorFilterToRepository() {
        when(repository.findByFilters(eq(null), eq("orwell"), eq(null), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        service.findAll(null, "orwell", null, 0, 20);

        verify(repository).findByFilters(eq(null), eq("orwell"), eq(null), any(Pageable.class));
    }

    @Test
    void findAllForwardsGenreFilterToRepository() {
        when(repository.findByFilters(eq(null), eq(null), eq("terror"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        service.findAll(null, null, "terror", 0, 20);

        verify(repository).findByFilters(eq(null), eq(null), eq("terror"), any(Pageable.class));
    }

    @Test
    void findAllForwardsAllFiltersToRepository() {
        when(repository.findByFilters(eq("1984"), eq("orwell"), eq("distop"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        service.findAll("1984", "orwell", "distop", 0, 20);

        verify(repository).findByFilters(eq("1984"), eq("orwell"), eq("distop"), any(Pageable.class));
    }

    // ── findAll — paginación ─────────────────────────────────────────────────

    @Test
    void findAllReturnsPaginationMetadata() {
        final List<Book> books = List.of(sampleBook);
        final var pageable = PageRequest.of(0, 20, Sort.by("code").ascending());
        when(repository.findByFilters(eq(null), eq(null), eq(null), any(Pageable.class)))
                .thenReturn(new PageImpl<>(books, pageable, 1L));

        final PageResponse<BookResponse> result = service.findAll(null, null, null, 0, 20);

        assertEquals(0, result.page());
        assertEquals(20, result.size());
        assertEquals(1L, result.totalElements());
        assertEquals(1, result.totalPages());
        assertEquals(false, result.hasNext());
        assertEquals(false, result.hasPrevious());
    }

    @Test
    void findAllClampsNegativePageToZero() {
        when(repository.findByFilters(eq(null), eq(null), eq(null), argThat(p -> p.getPageNumber() == 0)))
                .thenReturn(new PageImpl<>(List.of()));

        service.findAll(null, null, null, -5, 20);

        verify(repository).findByFilters(eq(null), eq(null), eq(null), argThat(p -> p.getPageNumber() == 0));
    }

    @Test
    void findAllClampsSizeTo100WhenExceeded() {
        when(repository.findByFilters(eq(null), eq(null), eq(null), argThat(p -> p.getPageSize() == 100)))
                .thenReturn(new PageImpl<>(List.of()));

        service.findAll(null, null, null, 0, 999);

        verify(repository).findByFilters(eq(null), eq(null), eq(null), argThat(p -> p.getPageSize() == 100));
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
        @SuppressWarnings("unchecked")
        final ArgumentCaptor<List<Object[]>> paramsCaptor = ArgumentCaptor.forClass(List.class);
        verify(jdbcTemplate).batchUpdate(anyString(), paramsCaptor.capture());
        final List<Object[]> params = paramsCaptor.getValue();
        assertEquals(3, params.size());
        assertEquals("M34", params.get(0)[1]);
        assertEquals("B07", params.get(1)[1]);
        assertEquals("Z91", params.get(2)[1]);
    }

    @Test
    void createAllThrowsWhenPoolHasFewerCodesThanRequested() {
        final List<BookRequest> requests = List.of(
            new BookRequest("L1", "A1", null, null, null),
            new BookRequest("L2", "A2", null, null, null)
        );
        when(codePoolRepository.lockAndPickCodes(2)).thenReturn(List.of("A01")); // solo 1 código

        assertThrows(BookCodePoolEmptyException.class, () -> service.createAll(requests));
        verify(jdbcTemplate, never()).batchUpdate(anyString(), anyList());
    }

    @Test
    void createAllDoesNothingForEmptyList() {
        service.createAll(List.of());
        verify(codePoolRepository, never()).lockAndPickCodes(anyInt());
        verify(jdbcTemplate, never()).batchUpdate(anyString(), anyList());
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
        @SuppressWarnings("unchecked")
        final ArgumentCaptor<List<Object[]>> paramsCaptor = ArgumentCaptor.forClass(List.class);
        verify(jdbcTemplate).batchUpdate(anyString(), paramsCaptor.capture());
        final List<Object[]> params = paramsCaptor.getValue();
        assertEquals(2, params.size());
        assertEquals(ts0, params.get(0)[7]); // created_at
        assertEquals(ts0, params.get(0)[8]); // updated_at
        assertEquals(ts1, params.get(1)[7]);
        assertEquals(ts1, params.get(1)[8]);
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

        verify(jdbcTemplate, never()).batchUpdate(anyString(), anyList());
    }
}
