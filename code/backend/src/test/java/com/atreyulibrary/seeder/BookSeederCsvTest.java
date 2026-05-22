package com.atreyulibrary.seeder;

import com.atreyulibrary.book.service.BookService;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookSeederCsvTest {

    private static final int CSV_BOOK_COUNT = 1500;

    @Mock
    private SeederLogRepository seederLogRepository;

    @Mock
    private BookService bookService;

    @InjectMocks
    private BookSeederCsv seeder;

    @Test
    void callsCreateAllOnceWithAllCsvRowsOnFirstRun() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);

        seeder.run();

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<BookRequest>> reqCaptor = ArgumentCaptor.forClass(List.class);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<OffsetDateTime>> tsCaptor = ArgumentCaptor.forClass(List.class);
        verify(bookService).createAll(reqCaptor.capture(), tsCaptor.capture());

        assertEquals(CSV_BOOK_COUNT, reqCaptor.getValue().size());
        assertEquals(CSV_BOOK_COUNT, tsCaptor.getValue().size());
        verify(seederLogRepository).save(any(SeederLog.class));
    }

    @Test
    void allParsedRequestsHaveTitleAndAuthor() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);

        seeder.run();

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<BookRequest>> captor = ArgumentCaptor.forClass(List.class);
        verify(bookService).createAll(captor.capture(), anyList());

        captor.getValue().forEach(r -> {
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
        verify(bookService).createAll(captor.capture(), anyList());

        final boolean hasEscapedQuote = captor.getValue().stream()
            .anyMatch(r -> r.title().contains("\"") || (r.synopsis() != null && r.synopsis().contains("\"")));
        assertTrue(hasEscapedQuote, "Debe haber al menos un campo con comillas dobles escapadas");
    }

    @Test
    void timestampsAreInThePast() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);

        seeder.run();

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<OffsetDateTime>> tsCaptor = ArgumentCaptor.forClass(List.class);
        verify(bookService).createAll(anyList(), tsCaptor.capture());

        final OffsetDateTime now = OffsetDateTime.now();
        final OffsetDateTime twoYearsAgo = now.minusDays(731); // +1 de buffer: nextLong incluye 730
        tsCaptor.getValue().forEach(ts -> {
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
