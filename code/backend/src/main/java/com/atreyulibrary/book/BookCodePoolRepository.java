package com.atreyulibrary.book;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/** Repositorio JPA para el pool de códigos disponibles. */
@Repository
public interface BookCodePoolRepository extends JpaRepository<BookCodePool, String> {

    /**
     * Selecciona y bloquea un código del pool de forma segura bajo concurrencia.
     * SKIP LOCKED evita que dos transacciones concurrentes tomen el mismo código.
     *
     * @return código disponible, o vacío si el pool está agotado
     */
    @Query(value = "SELECT code FROM book_code_pool LIMIT 1 FOR UPDATE SKIP LOCKED",
           nativeQuery = true)
    Optional<String> lockAndPickCode();
}
