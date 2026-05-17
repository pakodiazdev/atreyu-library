package com.atreyulibrary.book;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;

/**
 * Genera códigos de negocio para libros con el formato A00–Z99.
 * Intenta hasta {@code MAX_ATTEMPTS} veces encontrar un código disponible.
 */
@Component
public class BookCodeGenerator {

    private static final String LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final int MAX_ATTEMPTS = 100;
    private static final int DIGITS_BOUND = 100;

    private final SecureRandom random = new SecureRandom();

    /**
     * Genera un código libre usando el repositorio para verificar disponibilidad.
     *
     * @param repository repositorio de libros para verificar existencia del código
     * @return código único en formato A00–Z99 (ej. "A12", "Z99")
     * @throws IllegalStateException si no se encuentra un código libre en el número máximo de intentos
     */
    public String generate(final BookRepository repository) {
        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            final String code = buildCode();
            if (!repository.existsByCode(code)) {
                return code;
            }
        }
        throw new IllegalStateException(
            "No se pudo generar un código único después de " + MAX_ATTEMPTS + " intentos"
        );
    }

    private String buildCode() {
        final char letter = LETTERS.charAt(random.nextInt(LETTERS.length()));
        final int number = random.nextInt(DIGITS_BOUND);
        return String.format("%c%02d", letter, number);
    }
}
