package com.atreyulibrary.book;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/** Repositorio JPA para {@link Book}. */
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    /**
     * Retorna los libros que coincidan con los filtros no nulos.
     * La comparación es parcial e insensible a mayúsculas.
     *
     * @param title  subcadena opcional a buscar en el título
     * @param author subcadena opcional a buscar en el autor
     * @param genre  subcadena opcional a buscar en el género
     * @return libros coincidentes ordenados por código
     */
    // CAST(:x AS string) fuerza VARCHAR en Hibernate 6 — sin él, PostgreSQL
    // infiere bytea para parámetros nulos y falla en lower().
    @Query("SELECT b FROM Book b WHERE "
        + "(CAST(:title AS string) IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', CAST(:title AS string), '%'))) AND "
        + "(CAST(:author AS string) IS NULL OR LOWER(b.author) LIKE LOWER(CONCAT('%', CAST(:author AS string), '%'))) AND "
        + "(CAST(:genre AS string) IS NULL OR LOWER(b.genre) LIKE LOWER(CONCAT('%', CAST(:genre AS string), '%'))) "
        + "ORDER BY b.code ASC")
    List<Book> findByFilters(
        @Param("title") String title,
        @Param("author") String author,
        @Param("genre") String genre
    );

    /** Retorna el libro con el ULID dado, o vacío si no existe. */
    java.util.Optional<Book> findByUlid(String ulid);

    /** Retorna true si el código de negocio ya está en uso. */
    boolean existsByCode(String code);
}
