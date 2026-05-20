package com.atreyulibrary.book;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * Selecciona y bloquea {@code count} códigos del pool de forma atómica.
     * Usado para creación masiva: una sola query reserva todos los códigos necesarios.
     *
     * @param count número de códigos a reservar
     * @return lista de códigos disponibles (puede ser menor que count si el pool se agota)
     */
    @Transactional
    @Query(value = "SELECT code FROM book_code_pool ORDER BY random() LIMIT :count FOR UPDATE SKIP LOCKED",
           nativeQuery = true)
    List<String> lockAndPickCodes(@Param("count") int count);

    /**
     * Elimina en bloque los códigos indicados del pool.
     *
     * @param codes códigos a eliminar
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM BookCodePool b WHERE b.code IN :codes")
    void deleteAllByCodes(@Param("codes") Collection<String> codes);
}
