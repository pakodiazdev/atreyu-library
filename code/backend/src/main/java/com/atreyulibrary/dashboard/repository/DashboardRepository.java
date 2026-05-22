package com.atreyulibrary.dashboard.repository;

import com.atreyulibrary.book.model.Book;
import com.atreyulibrary.dashboard.dto.GenreStats;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/** Queries optimizadas para el dashboard de inicio. */
@Repository
public interface DashboardRepository extends JpaRepository<Book, Long> {

    /** Número de géneros distintos no nulos. */
    @Query("SELECT COUNT(DISTINCT b.genre) FROM Book b WHERE b.genre IS NOT NULL")
    long countDistinctGenres();

    /** Libros añadidos desde {@code since} (inclusive). */
    @Query("SELECT COUNT(b) FROM Book b WHERE b.createdAt >= :since")
    long countAddedSince(@Param("since") OffsetDateTime since);

    /** Últimos libros ordenados por fecha de creación descendente. El límite se controla con {@link Pageable}. */
    @Query("SELECT b FROM Book b ORDER BY b.createdAt DESC")
    List<Book> findRecentBooks(Pageable pageable);

    /**
     * Libros con actividad reciente (creados o editados), ordenados por el evento más reciente.
     * El límite se controla con {@link Pageable}.
     */
    @Query("SELECT b FROM Book b ORDER BY GREATEST(b.createdAt, b.updatedAt) DESC")
    List<Book> findRecentActivity(Pageable pageable);

    /** Géneros con su conteo, ordenados por conteo descendente. */
    @Query("""
            SELECT new com.atreyulibrary.dashboard.dto.GenreStats(b.genre, COUNT(b))
            FROM Book b
            WHERE b.genre IS NOT NULL
            GROUP BY b.genre
            ORDER BY COUNT(b) DESC
            """)
    List<GenreStats> findGenreStats();
}
