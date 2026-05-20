package com.atreyulibrary.book;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/** Repositorio JPA para el pool de códigos disponibles. */
@Repository
public interface BookCodePoolRepository extends JpaRepository<BookCodePool, String> {

    /**
     * Selecciona y bloquea un código del pool de forma segura bajo concurrencia.
     * SKIP LOCKED evita que dos transacciones concurrentes tomen el mismo código.
     * Requiere transacción de escritura — FOR UPDATE falla en contextos readOnly.
     *
     * @return código disponible, o vacío si el pool está agotado
     */
    @Transactional
    @Query(value = "SELECT code FROM book_code_pool ORDER BY random() LIMIT 1 FOR UPDATE SKIP LOCKED",
           nativeQuery = true)
    Optional<String> lockAndPickCode();
}
