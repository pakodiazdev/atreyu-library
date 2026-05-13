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
    @Query("SELECT b FROM Book b WHERE "
        + "(:title IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND "
        + "(:author IS NULL OR LOWER(b.author) LIKE LOWER(CONCAT('%', :author, '%'))) AND "
        + "(:genre IS NULL OR LOWER(b.genre) LIKE LOWER(CONCAT('%', :genre, '%'))) "
        + "ORDER BY b.code ASC")
    List<Book> findByFilters(
        @Param("title") String title,
        @Param("author") String author,
        @Param("genre") String genre
    );

    /** Retorna true si el código de negocio ya está en uso. */
    boolean existsByCode(String code);
}
