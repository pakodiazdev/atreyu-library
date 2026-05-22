import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { BookRepository } from './book.repository';
import { Book, BookCreatePayload, BookDetail, BookPage } from './book.model';

const MOCK_BOOKS: Book[] = [
  { code: 'A01', ulid: '01', title: 'El Nombre del Viento', author: 'Patrick Rothfuss', genre: 'Fantasía', publicationYear: 2007 },
  { code: 'A02', ulid: '02', title: 'Cien Años de Soledad', author: 'Gabriel García Márquez', genre: 'Realismo mágico', publicationYear: 1967 },
];

const emptyPage = (): BookPage => ({
  content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, hasNext: false, hasPrevious: false,
});

const pageOf = (...books: Book[]): BookPage => ({
  content: books, page: 0, size: 10, totalElements: books.length, totalPages: 1, hasNext: false, hasPrevious: false,
});

describe('BookRepository', () => {
  let repo: BookRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BookRepository,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    repo = TestBed.inject(BookRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('always sends page and size params', () => {
    repo.getAll().subscribe();

    const req = httpMock.expectOne(r => r.url === '/books');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    req.flush(emptyPage());
  });

  it('sends default page=0 and size=10 when no filters provided', () => {
    repo.getAll().subscribe();

    const req = httpMock.expectOne(r => r.url === '/books');
    expect(req.request.params.has('title')).toBe(false);
    expect(req.request.params.has('author')).toBe(false);
    expect(req.request.params.has('genre')).toBe(false);
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    req.flush(emptyPage());
  });

  it('sends custom page and size when provided', () => {
    repo.getAll({ page: 3, size: 50 }).subscribe();

    const req = httpMock.expectOne(r => r.url === '/books');
    expect(req.request.params.get('page')).toBe('3');
    expect(req.request.params.get('size')).toBe('50');
    req.flush(emptyPage());
  });

  it('adds title param when title filter is set', () => {
    repo.getAll({ title: 'Viento' }).subscribe();

    const req = httpMock.expectOne(r => r.url === '/books');
    expect(req.request.params.get('title')).toBe('Viento');
    expect(req.request.params.has('author')).toBe(false);
    expect(req.request.params.has('genre')).toBe(false);
    req.flush(emptyPage());
  });

  it('adds author param when author filter is set', () => {
    repo.getAll({ author: 'Tolkien' }).subscribe();

    const req = httpMock.expectOne(r => r.url === '/books');
    expect(req.request.params.get('author')).toBe('Tolkien');
    expect(req.request.params.has('title')).toBe(false);
    req.flush(emptyPage());
  });

  it('adds genre param when genre filter is set', () => {
    repo.getAll({ genre: 'Fantasía' }).subscribe();

    const req = httpMock.expectOne(r => r.url === '/books');
    expect(req.request.params.get('genre')).toBe('Fantasía');
    req.flush(emptyPage());
  });

  it('combines multiple filters into query params', () => {
    repo.getAll({ title: 'El', author: 'García', genre: 'Realismo mágico' }).subscribe();

    const req = httpMock.expectOne(r => r.url === '/books');
    expect(req.request.params.get('title')).toBe('El');
    expect(req.request.params.get('author')).toBe('García');
    expect(req.request.params.get('genre')).toBe('Realismo mágico');
    req.flush(emptyPage());
  });

  it('returns the BookPage response from the API', () => {
    let result: BookPage | undefined;
    repo.getAll().subscribe(p => (result = p));

    httpMock.expectOne(r => r.url === '/books').flush(pageOf(...MOCK_BOOKS));

    expect(result?.content).toEqual(MOCK_BOOKS);
    expect(result?.totalElements).toBe(2);
  });

  it('does not add filter params for undefined values', () => {
    repo.getAll({ title: undefined, author: undefined, genre: undefined }).subscribe();

    const req = httpMock.expectOne(r => r.url === '/books');
    expect(req.request.params.has('title')).toBe(false);
    expect(req.request.params.has('author')).toBe(false);
    expect(req.request.params.has('genre')).toBe(false);
    req.flush(emptyPage());
  });

  describe('getByCode', () => {
    const MOCK_DETAIL: BookDetail = {
      code: 'A01',
      ulid: '01JTEST00000000000000001',
      title: 'El Nombre del Viento',
      author: 'Patrick Rothfuss',
      genre: 'Fantasía',
      publicationYear: 2007,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    };

    it('calls GET /books/:code', () => {
      repo.getByCode('A01').subscribe();

      const req = httpMock.expectOne('/books/A01');
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_DETAIL);
    });

    it('returns the full BookDetail from the API', () => {
      let result: BookDetail | undefined;
      repo.getByCode('A01').subscribe(b => (result = b));

      httpMock.expectOne('/books/A01').flush(MOCK_DETAIL);

      expect(result).toEqual(MOCK_DETAIL);
    });

    it('propagates HTTP errors', () => {
      let errorStatus: number | undefined;
      repo.getByCode('Z99').subscribe({
        error: (e) => (errorStatus = e.status),
      });

      httpMock.expectOne('/books/Z99').flush(null, { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });

  describe('delete()', () => {
    it('calls DELETE /books/:ulid', () => {
      repo.delete('01JTEST00000000000000001').subscribe();

      const req = httpMock.expectOne('/books/01JTEST00000000000000001');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('completes on 204', () => {
      let completed = false;
      repo.delete('01JTEST00000000000000001').subscribe({
        complete: () => { completed = true; },
      });

      httpMock.expectOne('/books/01JTEST00000000000000001').flush(null, { status: 204, statusText: 'No Content' });

      expect(completed).toBe(true);
    });

    it('propagates HTTP errors', () => {
      let errorStatus: number | undefined;
      repo.delete('01JTEST00000000000000001').subscribe({
        error: (e) => (errorStatus = e.status),
      });

      httpMock.expectOne('/books/01JTEST00000000000000001').flush(null, { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });

  describe('create()', () => {
    const PAYLOAD: BookCreatePayload = {
      title: 'El Nombre del Viento',
      author: 'Patrick Rothfuss',
      genre: 'Fantasía',
      publicationYear: 2007,
      synopsis: null,
    };

    const CREATED: BookDetail = {
      code: 'A01',
      ulid: '01JTEST00000000000000001',
      title: 'El Nombre del Viento',
      author: 'Patrick Rothfuss',
      genre: 'Fantasía',
      publicationYear: 2007,
    };

    it('calls POST /books with the payload', () => {
      repo.create(PAYLOAD).subscribe();

      const req = httpMock.expectOne('/books');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(PAYLOAD);
      req.flush(CREATED);
    });

    it('returns the created BookDetail from the API', () => {
      let result: BookDetail | undefined;
      repo.create(PAYLOAD).subscribe(b => (result = b));

      httpMock.expectOne('/books').flush(CREATED);

      expect(result).toEqual(CREATED);
    });

    it('propagates 422 HTTP errors', () => {
      let errorStatus: number | undefined;
      repo.create(PAYLOAD).subscribe({
        error: (e) => (errorStatus = e.status),
      });

      httpMock.expectOne('/books').flush(
        { errors: { title: 'El título es obligatorio' } },
        { status: 422, statusText: 'Unprocessable Entity' },
      );

      expect(errorStatus).toBe(422);
    });

    it('sends null fields in the request body', () => {
      const minimalPayload: BookCreatePayload = {
        title: 'Test', author: 'Autor', genre: null, publicationYear: null, synopsis: null,
      };
      repo.create(minimalPayload).subscribe();

      const req = httpMock.expectOne('/books');
      expect(req.request.body.genre).toBeNull();
      expect(req.request.body.publicationYear).toBeNull();
      req.flush(CREATED);
    });
  });
});
