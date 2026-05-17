package com.atreyulibrary.book;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookCodeGeneratorTest {

    @Mock
    private BookRepository repository;

    @InjectMocks
    private BookCodeGenerator generator;

    // ── formato ──────────────────────────────────────────────────────────────

    @Test
    void generatesCodeWithValidFormat() {
        when(repository.existsByCode(anyString())).thenReturn(false);

        final String code = generator.generate(repository);

        assertNotNull(code);
        assertTrue(code.matches("[A-Z]\\d{2}"),
                "El código debe seguir el formato A00–Z99, pero fue: " + code);
    }

    @Test
    void generatedCodeHasLengthThree() {
        when(repository.existsByCode(anyString())).thenReturn(false);

        final String code = generator.generate(repository);

        assertEquals(3, code.length(),
                "El código debe tener exactamente 3 caracteres, pero fue: " + code);
    }

    @Test
    void firstCharacterIsUppercaseLetter() {
        when(repository.existsByCode(anyString())).thenReturn(false);

        final String code = generator.generate(repository);

        assertTrue(Character.isUpperCase(code.charAt(0)));
    }

    @Test
    void lastTwoCharactersAreDigits() {
        when(repository.existsByCode(anyString())).thenReturn(false);

        final String code = generator.generate(repository);

        assertTrue(Character.isDigit(code.charAt(1)));
        assertTrue(Character.isDigit(code.charAt(2)));
    }

    // ── unicidad ─────────────────────────────────────────────────────────────

    @Test
    void retriesWhenFirstCodeExists() {
        when(repository.existsByCode(anyString()))
                .thenReturn(true)
                .thenReturn(true)
                .thenReturn(false);

        final String code = generator.generate(repository);

        assertFalse(code.isEmpty());
    }

    @Test
    void throwsWhenAllAttemptsExhausted() {
        when(repository.existsByCode(anyString())).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> generator.generate(repository));
    }
}
