import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { BookRepository } from './book.repository';
import { Book } from './book.model';

const MOCK_BOOKS: Book[] = [
  { code: 'A01', ulid: '01', title: 'El Nombre del Viento', author: 'Patrick Rothfuss', genre: 'Fantasía', publicationYear: 2007 },
  { code: 'A02', ulid: '02', title: 'Cien Años de Soledad', author: 'Gabriel García Márquez', genre: 'Realismo mágico', publicationYear: 1967 },
];

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

  it('calls GET /books without params when no filters provided', () => {
    repo.getAll().subscribe();

    const req = httpMock.expectOne('/books');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys()).toHaveLength(0);
    req.flush([]);
  });

  it('adds title param when title filter is set', () => {
    repo.getAll({ title: 'Viento' }).subscribe();

    const req = httpMock.expectOne(r => r.url === '/books');
    expect(req.request.params.get('title')).toBe('Viento');
    expect(req.request.params.has('author')).toBe(false);
    expect(req.request.params.has('genre')).toBe(false);
    req.flush([]);
  });

  it('adds author param when author filter is set', () => {
    repo.getAll({ author: 'Tolkien' }).subscribe();

    const req = httpMock.expectOne(r => r.url === '/books');
    expect(req.request.params.get('author')).toBe('Tolkien');
    expect(req.request.params.has('title')).toBe(false);
    req.flush([]);
  });

  it('adds genre param when genre filter is set', () => {
    repo.getAll({ genre: 'Fantasía' }).subscribe();

    const req = httpMock.expectOne(r => r.url === '/books');
    expect(req.request.params.get('genre')).toBe('Fantasía');
    req.flush([]);
  });

  it('combines multiple filters into query params', () => {
    repo.getAll({ title: 'El', author: 'García', genre: 'Realismo mágico' }).subscribe();

    const req = httpMock.expectOne(r => r.url === '/books');
    expect(req.request.params.get('title')).toBe('El');
    expect(req.request.params.get('author')).toBe('García');
    expect(req.request.params.get('genre')).toBe('Realismo mágico');
    req.flush([]);
  });

  it('returns the response data from the API', () => {
    let result: Book[] | undefined;
    repo.getAll().subscribe(books => (result = books));

    httpMock.expectOne('/books').flush(MOCK_BOOKS);

    expect(result).toEqual(MOCK_BOOKS);
  });

  it('does not add params for undefined filter values', () => {
    repo.getAll({ title: undefined, author: undefined, genre: undefined }).subscribe();

    const req = httpMock.expectOne('/books');
    expect(req.request.params.keys()).toHaveLength(0);
    req.flush([]);
  });
});
