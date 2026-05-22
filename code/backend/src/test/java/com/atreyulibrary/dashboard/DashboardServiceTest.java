package com.atreyulibrary.dashboard;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.atreyulibrary.book.model.Book;
import com.atreyulibrary.book.dto.BookResponse;
import com.atreyulibrary.dashboard.dto.ActivityEntry;
import com.atreyulibrary.dashboard.dto.DashboardStatsResponse;
import com.atreyulibrary.dashboard.dto.GenreStats;
import com.atreyulibrary.dashboard.repository.DashboardRepository;
import com.atreyulibrary.dashboard.service.DashboardService;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private DashboardRepository repository;

    @InjectMocks
    private DashboardService service;

    // ── getStats ─────────────────────────────────────────────────────────────

    @Test
    void getStatsCombinesCountsFromRepository() {
        when(repository.count()).thenReturn(42L);
        when(repository.countDistinctGenres()).thenReturn(8L);
        when(repository.countAddedSince(any(OffsetDateTime.class))).thenReturn(3L);

        final DashboardStatsResponse stats = service.getStats();

        assertEquals(42L, stats.totalBooks());
        assertEquals(8L, stats.distinctGenres());
        assertEquals(3L, stats.addedThisMonth());
    }

    @Test
    void getStatsPassesStartOfCurrentMonthToRepository() {
        when(repository.count()).thenReturn(0L);
        when(repository.countDistinctGenres()).thenReturn(0L);
        when(repository.countAddedSince(any(OffsetDateTime.class))).thenAnswer(inv -> {
            final OffsetDateTime since = inv.getArgument(0);
            assertEquals(1, since.getDayOfMonth());
            assertEquals(0, since.getHour());
            assertEquals(0, since.getMinute());
            assertEquals(0, since.getSecond());
            assertEquals(ZoneOffset.UTC, since.getOffset());
            return 0L;
        });

        service.getStats();
    }

    // ── getRecentBooks ────────────────────────────────────────────────────────

    @Test
    void getRecentBooksMapsBookToBookResponse() {
        final Book book = Book.builder()
                .ulid("01JTEST00000000000000001")
                .code("A01")
                .title("El Nombre del Viento")
                .author("Patrick Rothfuss")
                .genre("Fantasía")
                .publicationYear(2007)
                .build();
        when(repository.findRecentBooks(any(Pageable.class))).thenReturn(List.of(book));

        final List<BookResponse> result = service.getRecentBooks();

        assertEquals(1, result.size());
        assertEquals("A01", result.get(0).code());
        assertEquals("El Nombre del Viento", result.get(0).title());
        assertEquals("Patrick Rothfuss", result.get(0).author());
    }

    @Test
    void getRecentBooksReturnsEmptyListWhenRepositoryReturnsNone() {
        when(repository.findRecentBooks(any(Pageable.class))).thenReturn(List.of());

        final List<BookResponse> result = service.getRecentBooks();

        assertEquals(0, result.size());
    }

    // ── getRecentActivity ─────────────────────────────────────────────────────

    @Test
    void getRecentActivityMapsCreatedEventWhenTimestampsAreEqual() {
        final OffsetDateTime ts = OffsetDateTime.now(ZoneOffset.UTC);
        final Book book = Book.builder()
                .code("A01").title("El Quijote").author("Cervantes")
                .createdAt(ts).updatedAt(ts)
                .build();
        when(repository.findRecentActivity(any(Pageable.class))).thenReturn(List.of(book));

        final List<ActivityEntry> result = service.getRecentActivity();

        assertEquals("CREATED", result.get(0).eventType());
        assertEquals("A01", result.get(0).bookCode());
    }

    @Test
    void getRecentActivityMapsUpdatedEventWhenUpdatedAtIsMoreThanOneSecondLater() {
        final OffsetDateTime created = OffsetDateTime.now(ZoneOffset.UTC).minusHours(1);
        final OffsetDateTime updated = created.plusSeconds(10);
        final Book book = Book.builder()
                .code("B02").title("La Odisea").author("Homero")
                .createdAt(created).updatedAt(updated)
                .build();
        when(repository.findRecentActivity(any(Pageable.class))).thenReturn(List.of(book));

        final List<ActivityEntry> result = service.getRecentActivity();

        assertEquals("UPDATED", result.get(0).eventType());
    }

    @Test
    void getRecentActivityUsesCreatedAtWhenEventTypeIsCreated() {
        final OffsetDateTime ts = OffsetDateTime.parse("2026-05-01T10:00:00Z");
        final Book book = Book.builder()
                .code("A01").title("Titulo").author("Autor")
                .createdAt(ts).updatedAt(ts)
                .build();
        when(repository.findRecentActivity(any(Pageable.class))).thenReturn(List.of(book));

        final List<ActivityEntry> result = service.getRecentActivity();

        assertEquals(ts.toString(), result.get(0).occurredAt());
    }

    @Test
    void getRecentActivityUsesUpdatedAtWhenEventTypeIsUpdated() {
        final OffsetDateTime created = OffsetDateTime.parse("2026-05-01T10:00:00Z");
        final OffsetDateTime updated = OffsetDateTime.parse("2026-05-02T12:00:00Z");
        final Book book = Book.builder()
                .code("B02").title("Titulo").author("Autor")
                .createdAt(created).updatedAt(updated)
                .build();
        when(repository.findRecentActivity(any(Pageable.class))).thenReturn(List.of(book));

        final List<ActivityEntry> result = service.getRecentActivity();

        assertEquals(updated.toString(), result.get(0).occurredAt());
    }

    @Test
    void getRecentActivityTreatsUpdateWithinOneSecondAsCreated() {
        final OffsetDateTime created = OffsetDateTime.parse("2026-05-01T10:00:00Z");
        final OffsetDateTime updated = created.plusNanos(500_000_000);
        final Book book = Book.builder()
                .code("C03").title("Titulo").author("Autor")
                .createdAt(created).updatedAt(updated)
                .build();
        when(repository.findRecentActivity(any(Pageable.class))).thenReturn(List.of(book));

        final List<ActivityEntry> result = service.getRecentActivity();

        assertEquals("CREATED", result.get(0).eventType());
    }

    // ── getGenreStats ─────────────────────────────────────────────────────────

    @Test
    void getGenreStatsDelegatesDirectlyToRepository() {
        final List<GenreStats> expected = List.of(
                new GenreStats("Novela", 5L),
                new GenreStats("Fantasía", 3L)
        );
        when(repository.findGenreStats()).thenReturn(expected);

        final List<GenreStats> result = service.getGenreStats();

        assertEquals(expected, result);
    }

    @Test
    void getGenreStatsReturnsEmptyListWhenRepositoryReturnsNone() {
        when(repository.findGenreStats()).thenReturn(List.of());

        final List<GenreStats> result = service.getGenreStats();

        assertEquals(0, result.size());
    }
}
