package com.atreyulibrary.dashboard.service;

import com.atreyulibrary.book.dto.BookResponse;
import com.atreyulibrary.book.model.Book;
import com.atreyulibrary.dashboard.dto.ActivityEntry;
import com.atreyulibrary.dashboard.dto.DashboardStatsResponse;
import com.atreyulibrary.dashboard.dto.GenreStats;
import com.atreyulibrary.dashboard.repository.DashboardRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Lógica de negocio para los datos del dashboard de inicio. */
@Service
@Transactional(readOnly = true)
public class DashboardService {

    private static final int RECENT_BOOKS_LIMIT    = 10;
    private static final int RECENT_ACTIVITY_LIMIT = 15;

    private final DashboardRepository repository;

    /** Inyección por constructor. */
    public DashboardService(final DashboardRepository repository) {
        this.repository = repository;
    }

    /**
     * Estadísticas generales del catálogo.
     *
     * @return totales de libros, géneros y añadidos este mes
     */
    public DashboardStatsResponse getStats() {
        final long total          = repository.count();
        final long genres         = repository.countDistinctGenres();
        final long addedThisMonth = repository.countAddedSince(startOfCurrentMonth());
        return new DashboardStatsResponse(total, genres, addedThisMonth);
    }

    /**
     * Últimos {@value #RECENT_BOOKS_LIMIT} libros añadidos al catálogo.
     *
     * @return libros ordenados por fecha de creación descendente
     */
    public List<BookResponse> getRecentBooks() {
        return repository.findRecentBooks(PageRequest.of(0, RECENT_BOOKS_LIMIT))
                .stream()
                .map(BookResponse::from)
                .toList();
    }

    /**
     * Actividad reciente del catálogo (creaciones y ediciones).
     * Distingue el tipo de evento comparando {@code createdAt} con {@code updatedAt}:
     * si son iguales, el libro fue creado; si difieren, fue editado después.
     *
     * @return entradas de actividad ordenadas por el evento más reciente
     */
    public List<ActivityEntry> getRecentActivity() {
        return repository.findRecentActivity(PageRequest.of(0, RECENT_ACTIVITY_LIMIT))
                .stream()
                .map(this::toActivityEntry)
                .toList();
    }

    /**
     * Géneros registrados en el catálogo con su conteo de libros.
     *
     * @return géneros ordenados por conteo descendente
     */
    public List<GenreStats> getGenreStats() {
        return repository.findGenreStats();
    }

    private OffsetDateTime startOfCurrentMonth() {
        final OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        return now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
    }

    private ActivityEntry toActivityEntry(final Book book) {
        final boolean isEdit = book.getUpdatedAt() != null
                && book.getCreatedAt() != null
                && book.getUpdatedAt().isAfter(book.getCreatedAt().plusSeconds(1));
        final String eventType  = isEdit ? "UPDATED" : "CREATED";
        final String occurredAt = isEdit
                ? book.getUpdatedAt().toString()
                : book.getCreatedAt().toString();
        return new ActivityEntry(
                book.getCode(),
                book.getTitle(),
                book.getAuthor(),
                eventType,
                occurredAt
        );
    }
}
