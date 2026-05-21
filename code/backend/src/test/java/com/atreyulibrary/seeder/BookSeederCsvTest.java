package com.atreyulibrary.seeder;

import com.atreyulibrary.book.BookService;
import com.atreyulibrary.book.dto.BookRequest;
import com.atreyulibrary.seeder.base.SeederLog;
import com.atreyulibrary.seeder.base.SeederLogRepository;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookSeederCsvTest {

    private static final int CSV_BOOK_COUNT = 1500;
    private static final int BATCH_SIZE = 100;
    private static final int EXPECTED_BATCHES = (CSV_BOOK_COUNT + BATCH_SIZE - 1) / BATCH_SIZE;

    @Mock
    private SeederLogRepository seederLogRepository;

    @Mock
    private BookService bookService;

    @InjectMocks
    private BookSeederCsv seeder;

    @Test
    void callsCreateAllInBatchesWithAllCsvRowsOnFirstRun() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);

        seeder.run();

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<BookRequest>> reqCaptor = ArgumentCaptor.forClass(List.class);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<OffsetDateTime>> tsCaptor = ArgumentCaptor.forClass(List.class);
        verify(bookService, times(EXPECTED_BATCHES)).createAll(reqCaptor.capture(), tsCaptor.capture());

        final int totalReqs = reqCaptor.getAllValues().stream().mapToInt(List::size).sum();
        final int totalTs = tsCaptor.getAllValues().stream().mapToInt(List::size).sum();
        assertEquals(CSV_BOOK_COUNT, totalReqs);
        assertEquals(CSV_BOOK_COUNT, totalTs);
        reqCaptor.getAllValues().forEach(batch ->
            assertTrue(batch.size() <= BATCH_SIZE, "Ningún lote debe superar BATCH_SIZE"));
        verify(seederLogRepository).save(any(SeederLog.class));
    }

    @Test
    void allParsedRequestsHaveTitleAndAuthor() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);

        seeder.run();

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<BookRequest>> captor = ArgumentCaptor.forClass(List.class);
        verify(bookService, times(EXPECTED_BATCHES)).createAll(captor.capture(), anyList());

        captor.getAllValues().stream().flatMap(List::stream).forEach(r -> {
            assertNotNull(r.title(), "title null en alguna fila");
            assertFalse(r.title().isBlank(), "title vacío en alguna fila");
            assertNotNull(r.author(), "author null en alguna fila");
            assertFalse(r.author().isBlank(), "author vacío en alguna fila");
        });
    }

    @Test
    void parsesEscapedQuotesCorrectly() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);

        seeder.run();

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<BookRequest>> captor = ArgumentCaptor.forClass(List.class);
        verify(bookService, times(EXPECTED_BATCHES)).createAll(captor.capture(), anyList());

        final boolean hasEscapedQuote = captor.getAllValues().stream()
            .flatMap(List::stream)
            .anyMatch(r -> r.title().contains("\"") || (r.synopsis() != null && r.synopsis().contains("\"")));
        assertTrue(hasEscapedQuote, "Debe haber al menos un campo con comillas dobles escapadas");
    }

    @Test
    void timestampsAreInThePast() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);

        seeder.run();

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<OffsetDateTime>> tsCaptor = ArgumentCaptor.forClass(List.class);
        verify(bookService, times(EXPECTED_BATCHES)).createAll(anyList(), tsCaptor.capture());

        final OffsetDateTime now = OffsetDateTime.now();
        final OffsetDateTime twoYearsAgo = now.minusDays(731); // +1 de buffer: nextLong incluye 730
        tsCaptor.getAllValues().stream().flatMap(List::stream).forEach(ts -> {
            assertTrue(ts.isBefore(now), "El timestamp no debería ser futuro");
            assertTrue(ts.isAfter(twoYearsAgo), "El timestamp no debería ser anterior a 2 años");
        });
    }

    @Test
    void skipsWhenAlreadyRan() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(true);

        seeder.run();

        verify(bookService, never()).createAll(any(), any());
        verify(seederLogRepository, never()).save(any());
    }

    private static void assertFalse(final boolean condition, final String message) {
        if (condition) {
            throw new AssertionError(message);
        }
    }
}
