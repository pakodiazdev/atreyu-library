package com.atreyulibrary.seeder;

import com.atreyulibrary.book.Book;
import com.atreyulibrary.book.BookRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

/**
 * Carga datos de muestra en la tabla de libros al iniciar en dev/qa.
 * Es idempotente: si los libros ya existen (constraint único en code), la excepción
 * se captura y se ignora sin interrumpir el arranque.
 */
@Component
@Profile({"dev", "qa"})
@Order(2)
public class BookSeeder implements CommandLineRunner {

    private final BookRepository repository;

    /** Inyección por constructor. */
    public BookSeeder(final BookRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(final String... args) {
        try {
            repository.saveAll(buildSampleBooks());
        } catch (DataIntegrityViolationException ignored) {
            // Los libros ya fueron insertados por una instancia anterior o concurrente
        }
    }

    private List<Book> buildSampleBooks() {
        return List.of(
            book("A01", "Cien años de soledad", "Gabriel García Márquez", "Realismo mágico", 1967),
            book("A02", "El señor de los anillos", "J.R.R. Tolkien", "Fantasía", 1954),
            book("A03", "1984", "George Orwell", "Distopía", 1949),
            book("A04", "Don Quijote de la Mancha", "Miguel de Cervantes", "Novela", 1605),
            book("A05", "Crimen y castigo", "Fiódor Dostoyevski", "Novela psicológica", 1866),
            book("A06", "El principito", "Antoine de Saint-Exupéry", "Fábula", 1943),
            book("A07", "Orgullo y prejuicio", "Jane Austen", "Romance", 1813),
            book("A08", "Moby Dick", "Herman Melville", "Aventura", 1851),
            book("A09", "La odisea", "Homero", "Épica", null),
            book("A10", "Frankenstein", "Mary Shelley", "Terror", 1818),
            book("B01", "El retrato de Dorian Gray", "Oscar Wilde", "Novela filosófica", 1890),
            book("B02", "Ulises", "James Joyce", "Modernismo", 1922),
            book("B03", "En busca del tiempo perdido", "Marcel Proust", "Novela", 1913),
            book("B04", "La metamorfosis", "Franz Kafka", "Surrealismo", 1915),
            book("B05", "El gran Gatsby", "F. Scott Fitzgerald", "Novela", 1925)
        );
    }

    private Book book(
            final String code,
            final String title,
            final String author,
            final String genre,
            final Integer year
    ) {
        return Book.builder()
                .code(code)
                .title(title)
                .author(author)
                .genre(genre)
                .publicationYear(year)
                .build();
    }
}
