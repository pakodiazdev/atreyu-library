import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { InicioRepository } from './inicio.repository';
import { DashboardStats, ActivityEntry, GenreStats } from './inicio.model';
import { Book } from '../books/book.model';

const MOCK_STATS: DashboardStats = { totalBooks: 42, distinctGenres: 8, addedThisMonth: 3 };

const MOCK_BOOKS: Book[] = [
  { code: 'A01', ulid: '01JTEST00000000000000001', title: 'El Quijote', author: 'Cervantes', genre: 'Novela', publicationYear: 1605 },
];

const MOCK_ACTIVITY: ActivityEntry[] = [
  { bookCode: 'A01', title: 'El Quijote', author: 'Cervantes', eventType: 'CREATED', occurredAt: '2026-05-21T10:00:00Z' },
];

const MOCK_GENRES: GenreStats[] = [
  { genre: 'Novela', count: 5 },
  { genre: 'Fantasía', count: 3 },
];

describe('InicioRepository', () => {
  let repo: InicioRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InicioRepository,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    repo = TestBed.inject(InicioRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getStats() calls GET /dashboard/stats', () => {
    repo.getStats().subscribe();
    const req = httpMock.expectOne('/dashboard/stats');
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_STATS);
  });

  it('getStats() returns the stats from the API', () => {
    let result: DashboardStats | undefined;
    repo.getStats().subscribe(s => (result = s));
    httpMock.expectOne('/dashboard/stats').flush(MOCK_STATS);
    expect(result).toEqual(MOCK_STATS);
  });

  it('getRecentBooks() calls GET /dashboard/recent-books', () => {
    repo.getRecentBooks().subscribe();
    const req = httpMock.expectOne('/dashboard/recent-books');
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_BOOKS);
  });

  it('getRecentBooks() returns the book list from the API', () => {
    let result: Book[] | undefined;
    repo.getRecentBooks().subscribe(b => (result = b));
    httpMock.expectOne('/dashboard/recent-books').flush(MOCK_BOOKS);
    expect(result).toEqual(MOCK_BOOKS);
  });

  it('getRecentActivity() calls GET /dashboard/recent-activity', () => {
    repo.getRecentActivity().subscribe();
    const req = httpMock.expectOne('/dashboard/recent-activity');
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_ACTIVITY);
  });

  it('getRecentActivity() returns activity entries from the API', () => {
    let result: ActivityEntry[] | undefined;
    repo.getRecentActivity().subscribe(a => (result = a));
    httpMock.expectOne('/dashboard/recent-activity').flush(MOCK_ACTIVITY);
    expect(result).toEqual(MOCK_ACTIVITY);
  });

  it('getGenreStats() calls GET /dashboard/genres', () => {
    repo.getGenreStats().subscribe();
    const req = httpMock.expectOne('/dashboard/genres');
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_GENRES);
  });

  it('getGenreStats() returns genre stats from the API', () => {
    let result: GenreStats[] | undefined;
    repo.getGenreStats().subscribe(g => (result = g));
    httpMock.expectOne('/dashboard/genres').flush(MOCK_GENRES);
    expect(result).toEqual(MOCK_GENRES);
  });
});
