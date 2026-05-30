import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { GenerosRepository } from './generos.repository';
import { GenreStats } from './generos.model';
import { Book } from '../books/book.model';

const GENRES: GenreStats[] = [
  { genre: 'Fantasía', count: 5 },
  { genre: 'Novela', count: 3 },
];

const BOOKS: Book[] = [
  { code: 'A01', ulid: '01', title: 'El Nombre del Viento', author: 'Rothfuss', genre: 'Fantasía', publicationYear: 2007 },
];

const pageOf = (...books: Book[]) => ({
  content: books, page: 0, size: 10, totalElements: books.length, totalPages: 1, hasNext: false, hasPrevious: false,
});

describe('GenerosRepository', () => {
  let repo: GenerosRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GenerosRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repo      = TestBed.inject(GenerosRepository);
    httpMock  = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getGenres()', () => {
    it('calls GET /dashboard/genres', () => {
      repo.getGenres().subscribe();
      const req = httpMock.expectOne('/dashboard/genres');
      expect(req.request.method).toBe('GET');
      req.flush(GENRES);
    });

    it('returns the genres array from the API', () => {
      let result: GenreStats[] | undefined;
      repo.getGenres().subscribe(g => (result = g));
      httpMock.expectOne('/dashboard/genres').flush(GENRES);
      expect(result).toEqual(GENRES);
    });
  });

  describe('getBooksByGenre()', () => {
    it('calls GET /books with genre, page=0 and size=10', () => {
      repo.getBooksByGenre('Fantasía').subscribe();
      const req = httpMock.expectOne(r => r.url === '/books');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('genre')).toBe('Fantasía');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      req.flush(pageOf(...BOOKS));
    });

    it('returns a page with the genre books', () => {
      let result: { content: Book[]; totalElements: number } | undefined;
      repo.getBooksByGenre('Fantasía').subscribe(p => (result = p));
      httpMock.expectOne(r => r.url === '/books').flush(pageOf(...BOOKS));
      expect(result?.content).toEqual(BOOKS);
    });
  });
});
