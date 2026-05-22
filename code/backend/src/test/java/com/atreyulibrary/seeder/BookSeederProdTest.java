package com.atreyulibrary.seeder;

import com.atreyulibrary.book.exception.BookCodePoolEmptyException;
import com.atreyulibrary.book.service.BookService;
import com.atreyulibrary.book.dto.BookRequest;
import com.atreyulibrary.seeder.base.SeederLog;
import com.atreyulibrary.seeder.base.SeederLogRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookSeederProdTest {

    private static final int CATALOG_SIZE = 15;

    @Mock
    private SeederLogRepository seederLogRepository;

    @Mock
    private BookService bookService;

    @InjectMocks
    private BookSeederProd seeder;

    @Test
    void createsAllBooksViaServiceOnFirstRun() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);

        seeder.run();

        verify(bookService, times(CATALOG_SIZE)).create(any(BookRequest.class));
        verify(seederLogRepository).save(any(SeederLog.class));
    }

    @Test
    void allCreatedBooksHaveTitleAndAuthor() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);

        seeder.run();

        ArgumentCaptor<BookRequest> captor = ArgumentCaptor.forClass(BookRequest.class);
        verify(bookService, times(CATALOG_SIZE)).create(captor.capture());

        List<BookRequest> requests = captor.getAllValues();
        assertEquals(CATALOG_SIZE, requests.size());
        requests.forEach(r -> {
            assertTrue(r.title() != null && !r.title().isBlank(), "title should not be blank");
            assertTrue(r.author() != null && !r.author().isBlank(), "author should not be blank");
        });
    }

    @Test
    void doesNotPersistSeederLogWhenPoolIsExhausted() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);
        doThrow(BookCodePoolEmptyException.class).when(bookService).create(any(BookRequest.class));

        assertThrows(BookCodePoolEmptyException.class, () -> seeder.run());

        verify(seederLogRepository, never()).save(any());
    }

    @Test
    void skipsWhenAlreadyRan() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(true);

        seeder.run();

        verify(bookService, never()).create(any());
        verify(seederLogRepository, never()).save(any());
    }
}
