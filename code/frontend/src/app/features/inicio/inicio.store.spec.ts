import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { InicioStore } from './inicio.store';
import { InicioRepository } from './inicio.repository';
import { DashboardStats, ActivityEntry, GenreStats } from './inicio.model';
import { Book } from '../books/book.model';

const MOCK_STATS: DashboardStats     = { totalBooks: 42, distinctGenres: 8, addedThisMonth: 3 };
const MOCK_BOOKS: Book[]             = [
  { code: 'A01', ulid: '01', title: 'El Quijote', author: 'Cervantes', genre: 'Novela', publicationYear: 1605 },
];
const MOCK_ACTIVITY: ActivityEntry[] = [
  { bookCode: 'A01', title: 'El Quijote', author: 'Cervantes', eventType: 'CREATED', occurredAt: '2026-05-21T10:00:00Z' },
];
const MOCK_GENRES: GenreStats[]      = [{ genre: 'Novela', count: 5 }];

const EMPTY_REPO = {
  getStats:         vi.fn().mockReturnValue(of(null)),
  getRecentBooks:   vi.fn().mockReturnValue(of([])),
  getRecentActivity: vi.fn().mockReturnValue(of([])),
  getGenreStats:    vi.fn().mockReturnValue(of([])),
};

function setupStore(overrides: Partial<typeof EMPTY_REPO> = {}): InicioStore {
  const repo = { ...EMPTY_REPO, ...overrides };
  TestBed.configureTestingModule({
    providers: [
      InicioStore,
      { provide: InicioRepository, useValue: repo },
    ],
  });
  return TestBed.inject(InicioStore);
}

describe('InicioStore', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('stats() is null initially', () => {
    const store = setupStore();
    expect(store.stats()).toBeNull();
  });

  it('recentBooks() is empty array initially', () => {
    const store = setupStore();
    expect(store.recentBooks()).toEqual([]);
  });

  it('activity() is empty array initially', () => {
    const store = setupStore();
    expect(store.activity()).toEqual([]);
  });

  it('genres() is empty array initially', () => {
    const store = setupStore();
    expect(store.genres()).toEqual([]);
  });

  it('statsLoading is true while stats resource is pending', () => {
    const store = setupStore();
    expect(store.statsLoading()).toBe(true);
  });

  it('stats() returns data after resource resolves', async () => {
    vi.useFakeTimers();
    const store = setupStore({ getStats: vi.fn().mockReturnValue(of(MOCK_STATS)) });

    vi.runAllTimers();
    await Promise.resolve();
    TestBed.flushEffects();
    vi.useRealTimers();

    expect(store.stats()).toEqual(MOCK_STATS);
  });

  it('recentBooks() returns data after resource resolves', async () => {
    vi.useFakeTimers();
    const store = setupStore({ getRecentBooks: vi.fn().mockReturnValue(of(MOCK_BOOKS)) });

    vi.runAllTimers();
    await Promise.resolve();
    TestBed.flushEffects();
    vi.useRealTimers();

    expect(store.recentBooks()).toEqual(MOCK_BOOKS);
  });

  it('activity() returns data after resource resolves', async () => {
    vi.useFakeTimers();
    const store = setupStore({ getRecentActivity: vi.fn().mockReturnValue(of(MOCK_ACTIVITY)) });

    vi.runAllTimers();
    await Promise.resolve();
    TestBed.flushEffects();
    vi.useRealTimers();

    expect(store.activity()).toEqual(MOCK_ACTIVITY);
  });

  it('genres() returns data after resource resolves', async () => {
    vi.useFakeTimers();
    const store = setupStore({ getGenreStats: vi.fn().mockReturnValue(of(MOCK_GENRES)) });

    vi.runAllTimers();
    await Promise.resolve();
    TestBed.flushEffects();
    vi.useRealTimers();

    expect(store.genres()).toEqual(MOCK_GENRES);
  });

  it('statsLoading is false after resource resolves', async () => {
    vi.useFakeTimers();
    const store = setupStore({ getStats: vi.fn().mockReturnValue(of(MOCK_STATS)) });

    vi.runAllTimers();
    await Promise.resolve();
    TestBed.flushEffects();
    vi.useRealTimers();

    expect(store.statsLoading()).toBe(false);
  });
});
