package com.atreyulibrary.seeder;

import com.atreyulibrary.book.BookRepository;
import com.atreyulibrary.seeder.base.SeederLog;
import com.atreyulibrary.seeder.base.SeederLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookSeederProdTest {

    @Mock
    private SeederLogRepository seederLogRepository;

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private BookSeederProd seeder;

    @Test
    void savesAllBooksOnFirstRun() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);

        seeder.run();

        verify(bookRepository).saveAll(anyList());
        verify(seederLogRepository).save(any(SeederLog.class));
    }

    @Test
    void skipsWhenAlreadyRan() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(true);

        seeder.run();

        verify(bookRepository, never()).saveAll(anyList());
        verify(seederLogRepository, never()).save(any());
    }
}
