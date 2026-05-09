package com.atreyulibrary.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class IsbnUtilsTest {

    // ── isValidIsbn13 ────────────────────────────────────────────────────────

    @Test
    void validIsbn13WithoutSeparatorsReturnsTrue() {
        assertTrue(IsbnUtils.isValidIsbn13("9780306406157"));
    }

    @Test
    void validIsbn13WithHyphensReturnsTrue() {
        assertTrue(IsbnUtils.isValidIsbn13("978-0-306-40615-7"));
    }

    @Test
    void validIsbn13WithSpacesReturnsTrue() {
        assertTrue(IsbnUtils.isValidIsbn13("978 0 306 40615 7"));
    }

    @Test
    void nullIsbnReturnsFalse() {
        assertFalse(IsbnUtils.isValidIsbn13(null));
    }

    @Test
    void tooShortIsbnReturnsFalse() {
        assertFalse(IsbnUtils.isValidIsbn13("978030640615"));
    }

    @Test
    void tooLongIsbnReturnsFalse() {
        assertFalse(IsbnUtils.isValidIsbn13("97803064061570"));
    }

    @Test
    void nonNumericIsbnReturnsFalse() {
        assertFalse(IsbnUtils.isValidIsbn13("978030640615X"));
    }

    @Test
    void wrongCheckDigitReturnsFalse() {
        assertFalse(IsbnUtils.isValidIsbn13("9780306406158"));
    }

    // ── normalise ────────────────────────────────────────────────────────────

    @Test
    void normaliseStripsHyphens() {
        assertEquals("9780306406157", IsbnUtils.normalise("978-0-306-40615-7"));
    }

    @Test
    void normaliseStripsSpaces() {
        assertEquals("9780306406157", IsbnUtils.normalise("978 0 306 40615 7"));
    }

    @Test
    void normaliseNullReturnsNull() {
        assertNull(IsbnUtils.normalise(null));
    }

    @Test
    void normalisePlainDigitsUnchanged() {
        assertEquals("9780306406157", IsbnUtils.normalise("9780306406157"));
    }
}
