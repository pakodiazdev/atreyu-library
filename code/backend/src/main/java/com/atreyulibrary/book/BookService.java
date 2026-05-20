package com.atreyulibrary.book;

import com.atreyulibrary.book.dto.BookRequest;
import com.atreyulibrary.book.dto.BookResponse;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Lógica de negocio para operaciones del catálogo de libros. */
@Service
@Transactional(readOnly = true)
public class BookService {

    private final BookRepository repository;
    private final BookCodePoolRepository codePoolRepository;

    /** Inyección por constructor. */
    public BookService(
            final BookRepository repository,
            final BookCodePoolRepository codePoolRepository
    ) {
        this.repository = repository;
        this.codePoolRepository = codePoolRepository;
    }

    /**
     * Retorna el libro con el código de negocio dado.
     *
     * @param code código de negocio del libro (ej. "A01")
     * @return libro como {@link BookResponse}
     * @throws BookNotFoundException si no existe un libro con ese código
     */
    public BookResponse getByCode(final String code) {
        return repository.findByCode(code)
                .map(BookResponse::from)
                .orElseThrow(() -> new BookNotFoundException(code));
    }

    /**
     * Retorna todos los libros que coincidan con los filtros opcionales.
     * Los parámetros nulos o en blanco se tratan como "sin filtro".
     *
     * @param title  subcadena opcional de título
     * @param author subcadena opcional de autor
     * @param genre  subcadena opcional de género
     * @return lista de libros como {@link BookResponse}
     */
    public List<BookResponse> findAll(
            final String title,
            final String author,
            final String genre
    ) {
        final String normalizedTitle = blankToNull(title);
        final String normalizedAuthor = blankToNull(author);
        final String normalizedGenre = blankToNull(genre);
        return repository
                .findByFilters(normalizedTitle, normalizedAuthor, normalizedGenre)
                .stream()
                .map(BookResponse::from)
                .toList();
    }

    /**
     * Crea un nuevo libro a partir del request, generando su código de negocio y ULID.
     *
     * @param request datos del nuevo libro
     * @return libro creado como {@link BookResponse}
     */
    @Transactional
    public BookResponse create(final BookRequest request) {
        final String code = codePoolRepository.lockAndPickCode()
                .orElseThrow(BookCodePoolEmptyException::new);
        codePoolRepository.deleteById(code);
        final Book book = Book.builder()
                .code(code)
                .title(request.title())
                .author(request.author())
                .genre(request.genre())
                .publicationYear(request.publicationYear())
                .synopsis(request.synopsis())
                .build();
        return BookResponse.from(repository.save(book));
    }

    private String blankToNull(final String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value;
    }

    /**
     * Crea múltiples libros en una sola transacción.
     * Reserva todos los códigos de golpe con una query bulk, luego hace un saveAll.
     *
     * @param requests lista de datos de los libros a crear
     * @throws BookCodePoolEmptyException si el pool no tiene suficientes códigos
     */
    @Transactional
    public void createAll(final List<BookRequest> requests) {
        doCreateAll(requests, null);
    }

    /**
     * Crea múltiples libros en una sola transacción con timestamps opcionales.
     * Si {@code createdAts} es null, {@code @PrePersist} aplica {@code OffsetDateTime.now()}.
     * Usado por seeders que necesitan distribuir fechas de alta en el pasado.
     *
     * @param requests   datos de los libros
     * @param createdAts lista de fechas de creación (mismo tamaño que requests), o null
     */
    @Transactional
    public void createAll(final List<BookRequest> requests, final List<OffsetDateTime> createdAts) {
        doCreateAll(requests, createdAts);
    }

    private void doCreateAll(final List<BookRequest> requests, final List<OffsetDateTime> createdAts) {
        if (requests.isEmpty()) {
            return;
        }
        final int count = requests.size();
        if (createdAts != null && createdAts.size() != count) {
            throw new IllegalArgumentException(
                "createdAts.size() (" + createdAts.size() + ") != requests.size() (" + count + ")");
        }
        final List<String> codes = codePoolRepository.lockAndPickCodes(count);
        if (codes.size() < count) {
            throw new BookCodePoolEmptyException();
        }
        codePoolRepository.deleteAllByCodes(codes);
        final List<Book> books = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            final BookRequest req = requests.get(i);
            final OffsetDateTime ts = (createdAts != null) ? createdAts.get(i) : null;
            books.add(Book.builder()
                    .code(codes.get(i))
                    .title(req.title())
                    .author(req.author())
                    .genre(req.genre())
                    .publicationYear(req.publicationYear())
                    .synopsis(req.synopsis())
                    .createdAt(ts)
                    .updatedAt(ts)
                    .build());
        }
        repository.saveAll(books);
    }

    /**
     * Actualiza los datos de un libro existente. El {@code code} es inmutable.
     *
     * @param ulid    identificador externo del libro
     * @param request datos de actualización validados
     * @return libro actualizado como {@link BookResponse}
     * @throws BookNotFoundException si no existe un libro con ese ULID
     */
    @Transactional
    public BookResponse update(final String ulid, final BookRequest request) {
        final Book book = repository.findByUlid(ulid)
                .orElseThrow(() -> new BookNotFoundException(ulid));
        book.setTitle(request.title());
        book.setAuthor(request.author());
        book.setGenre(request.genre());
        book.setPublicationYear(request.publicationYear());
        book.setSynopsis(request.synopsis());
        return BookResponse.from(repository.save(book));
    }

    /**
     * Elimina el libro con el ULID dado y devuelve su código al pool.
     *
     * @param ulid identificador externo del libro
     * @throws BookNotFoundException si no existe un libro con ese ULID
     */
    @Transactional
    public void deleteByUlid(final String ulid) {
        final Book book = repository.findByUlid(ulid)
                .orElseThrow(() -> new BookNotFoundException(ulid));
        repository.delete(book);
        codePoolRepository.save(new BookCodePool(book.getCode()));
    }
}
