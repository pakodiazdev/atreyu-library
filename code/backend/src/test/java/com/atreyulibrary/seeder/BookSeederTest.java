package com.atreyulibrary.seeder;

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

import com.atreyulibrary.book.BookRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

@ExtendWith(MockitoExtension.class)
class BookSeederTest {

    @Mock
    private BookRepository repository;

    @InjectMocks
    private BookSeeder seeder;

    @Test
    void savesAllSampleBooksOnRun() {
        seeder.run();

        verify(repository).saveAll(anyList());
    }

    @Test
    void doesNotThrowWhenBooksAlreadyExist() {
        doThrow(new DataIntegrityViolationException("duplicate key"))
                .when(repository).saveAll(anyList());

        seeder.run();

        verify(repository).saveAll(anyList());
    }
}
