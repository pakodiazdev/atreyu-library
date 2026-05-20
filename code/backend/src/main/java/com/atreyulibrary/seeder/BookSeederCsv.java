package com.atreyulibrary.seeder;

import com.atreyulibrary.book.BookService;
import com.atreyulibrary.book.dto.BookRequest;
import com.atreyulibrary.seeder.base.OnceSeeder;
import com.atreyulibrary.seeder.base.SeederLogRepository;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
@Profile({"dev", "qa", "prod"})
@Order(3)
public class BookSeederCsv extends OnceSeeder {

    private static final String CSV_PATH = "data/libros.csv";

    private final BookService bookService;

    public BookSeederCsv(
            final BookService bookService,
            final SeederLogRepository seederLogRepository) {
        super(seederLogRepository);
        this.bookService = bookService;
    }

    private static final int SPREAD_DAYS = 730; // rango [0, SPREAD_DAYS] días → ~2 años hacia atrás
    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    protected void seed() {
        final List<BookRequest> requests = loadFromCsv();
        final List<OffsetDateTime> timestamps = randomTimestamps(requests.size());
        bookService.createAll(requests, timestamps);
    }

    private List<OffsetDateTime> randomTimestamps(final int count) {
        final OffsetDateTime now = OffsetDateTime.now();
        final List<OffsetDateTime> timestamps = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            // +1 para incluir SPREAD_DAYS en el rango (nextLong excluye el límite superior)
            timestamps.add(now.minusDays(RANDOM.nextLong(SPREAD_DAYS + 1L)));
        }
        return timestamps;
    }

    private List<BookRequest> loadFromCsv() {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                new ClassPathResource(CSV_PATH).getInputStream(), StandardCharsets.UTF_8))) {

            final String header = reader.readLine();
            if (header == null) { // CSV vacío — sin filas de datos
                return List.of();
            }
            final List<BookRequest> requests = new ArrayList<>();
            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.isBlank()) {
                    requests.add(parseLine(line));
                }
            }
            return requests;
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo leer " + CSV_PATH, e);
        }
    }

    /** Punto de entrada: parsea una línea CSV y construye el BookRequest. */
    private BookRequest parseLine(final String line) {
        return buildRequest(parseFields(line), line);
    }

    /** Tokeniza la línea en campos CSV, manejando comillas y escapes ("" → "). Solo soporta registros de una sola línea. */
    private List<String> parseFields(final String line) {
        final List<String> fields = new ArrayList<>();
        final StringBuilder field = new StringBuilder();
        boolean inQuotes = false;
        int i = 0;
        while (i < line.length()) {
            final char c = line.charAt(i++);
            if (c == ',' && !inQuotes) {
                fields.add(field.toString());
                field.setLength(0);
            } else if (c == '"' && !inQuotes) {
                inQuotes = true;
            } else if (c == '"' && inQuotes && i < line.length() && line.charAt(i) == '"') {
                field.append('"');
                i++;
            } else if (c == '"') {
                inQuotes = false;
            } else {
                field.append(c);
            }
        }
        fields.add(field.toString());
        return fields;
    }

    /** Extrae los campos de la lista y construye el BookRequest. */
    private BookRequest buildRequest(final List<String> fields, final String line) {
        if (fields.size() < 4) {
            throw new IllegalStateException("Línea CSV malformada (< 4 campos): " + line);
        }
        final String title   = fields.get(0);
        final String author  = fields.get(1);
        final Integer year   = fields.get(2).isBlank() ? null : Integer.parseInt(fields.get(2).trim());
        final String genre   = fields.get(3).isBlank() ? null : fields.get(3);
        final String synopsis = fields.size() > 4 && !fields.get(4).isBlank() ? fields.get(4) : null;
        return new BookRequest(title, author, genre, year, synopsis);
    }
}
