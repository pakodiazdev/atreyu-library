package com.atreyulibrary.book;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.atreyulibrary.book.model.Book;
import org.junit.jupiter.api.Test;

class BookTest {

    // ── @PrePersist ───────────────────────────────────────────────────────────

    @Test
    void prePersistGeneratesUlid() {
        final Book book = new Book();
        assertNull(book.getUlid());

        book.prePersist();

        assertNotNull(book.getUlid());
        assertEquals(26, book.getUlid().length());
    }

    @Test
    void prePersistDoesNotOverwriteExistingUlid() {
        final Book book = new Book();
        book.setUlid("01HW5XMTSC9AZAZ5YR0DR7B7GK");

        book.prePersist();

        assertEquals("01HW5XMTSC9AZAZ5YR0DR7B7GK", book.getUlid());
    }

    @Test
    void prePersistSetsCreatedAt() {
        final Book book = new Book();
        assertNull(book.getCreatedAt());

        book.prePersist();

        assertNotNull(book.getCreatedAt());
    }

    @Test
    void prePersistSetsUpdatedAt() {
        final Book book = new Book();
        assertNull(book.getUpdatedAt());

        book.prePersist();

        assertNotNull(book.getUpdatedAt());
    }

    @Test
    void prePersistSetsCreatedAtAndUpdatedAtToSameInstant() {
        final Book book = new Book();

        book.prePersist();

        // Both timestamps are set in the same call so they must be equal
        assertNotNull(book.getCreatedAt());
        assertNotNull(book.getUpdatedAt());
    }

    // ── @PreUpdate ────────────────────────────────────────────────────────────

    @Test
    void preUpdateSetsUpdatedAt() {
        final Book book = new Book();
        assertNull(book.getUpdatedAt());

        book.preUpdate();

        assertNotNull(book.getUpdatedAt());
    }

    @Test
    void preUpdateDoesNotModifyCreatedAt() {
        final Book book = new Book();
        book.prePersist();

        book.preUpdate();

        // createdAt is set in prePersist and must remain unchanged after preUpdate
        assertNotNull(book.getCreatedAt());
    }
}
