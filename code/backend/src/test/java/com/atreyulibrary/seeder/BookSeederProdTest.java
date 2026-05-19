package com.atreyulibrary.seeder;

import com.atreyulibrary.book.BookCodePoolEmptyException;
import com.atreyulibrary.book.BookCodePoolRepository;
import com.atreyulibrary.book.BookRepository;
import com.atreyulibrary.seeder.base.SeederLog;
import com.atreyulibrary.seeder.base.SeederLogRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookSeederProdTest {

    @Mock
    private SeederLogRepository seederLogRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private BookCodePoolRepository codePoolRepository;

    @InjectMocks
    private BookSeederProd seeder;

    @Test
    void savesAllBooksOnFirstRun() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);
        when(codePoolRepository.lockAndPickCode())
            .thenReturn(Optional.of("A01"), Optional.of("B02"), Optional.of("C03"),
                        Optional.of("D04"), Optional.of("E05"), Optional.of("F06"),
                        Optional.of("G07"), Optional.of("H08"), Optional.of("I09"),
                        Optional.of("J10"), Optional.of("K11"), Optional.of("L12"),
                        Optional.of("M13"), Optional.of("N14"), Optional.of("O15"));

        seeder.run();

        verify(bookRepository).saveAll(anyList());
        verify(codePoolRepository, atLeast(15)).lockAndPickCode();
        verify(codePoolRepository, atLeast(15)).deleteById(anyString());
        verify(seederLogRepository).save(any(SeederLog.class));
    }

    @Test
    void skipsWhenAlreadyRan() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(true);

        seeder.run();

        verify(bookRepository, never()).saveAll(anyList());
        verify(seederLogRepository, never()).save(any());
    }

    @Test
    void throwsWhenPoolIsEmpty() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);
        when(codePoolRepository.lockAndPickCode()).thenReturn(Optional.empty());

        assertThrows(BookCodePoolEmptyException.class, () -> seeder.run());
    }
}
