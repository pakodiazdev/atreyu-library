package com.atreyulibrary.seeder;

import com.atreyulibrary.book.BookCodeGenerator;
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
    private BookCodeGenerator codeGenerator;

    @InjectMocks
    private BookSeederProd seeder;

    @Test
    void savesAllBooksOnFirstRun() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);
        when(codeGenerator.generate(bookRepository))
            .thenReturn("A01", "B02", "C03", "D04", "E05", "F06", "G07", "H08",
                        "I09", "J10", "K11", "L12", "M13", "N14", "O15");

        seeder.run();

        verify(bookRepository).saveAll(anyList());
        verify(codeGenerator, atLeast(15)).generate(bookRepository);
        verify(seederLogRepository).save(any(SeederLog.class));
    }

    @Test
    void retriesWhenGeneratorReturnsDuplicateWithinBatch() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);
        // A01 se repite en la segunda llamada; el do-while lo descarta y pide otro
        when(codeGenerator.generate(bookRepository))
            .thenReturn("A01", "A01", "B02", "C03", "D04", "E05", "F06", "G07", "H08",
                        "I09", "J10", "K11", "L12", "M13", "N14", "O15");

        seeder.run();

        verify(bookRepository).saveAll(anyList());
        verify(codeGenerator, atLeast(16)).generate(bookRepository);
    }

    @Test
    void skipsWhenAlreadyRan() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(true);

        seeder.run();

        verify(bookRepository, never()).saveAll(anyList());
        verify(seederLogRepository, never()).save(any());
    }
}
