import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { BookListStore } from './book-list.store';
import { BookRepository } from '../book.repository';
import { Book, BookPage } from '../book.model';

const MOCK_BOOKS: Book[] = [
  { code: 'A01', ulid: '01', title: 'El Nombre del Viento', author: 'Patrick Rothfuss', genre: 'Fantasía', publicationYear: 2007 },
];

const emptyPage: BookPage = {
  content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, hasNext: false, hasPrevious: false,
};

const pageOfMockBooks: BookPage = {
  content: MOCK_BOOKS, page: 0, size: 10, totalElements: 1, totalPages: 1, hasNext: false, hasPrevious: false,
};

describe('BookListStore', () => {
  let store: BookListStore;
  const mockRepo = { getAll: vi.fn().mockReturnValue(of(emptyPage)) };

  beforeEach(() => {
    mockRepo.getAll.mockReturnValue(of(emptyPage));

    TestBed.configureTestingModule({
      providers: [
        BookListStore,
        { provide: BookRepository, useValue: mockRepo },
      ],
    });
    store = TestBed.inject(BookListStore);
  });

  // ── filtros ──────────────────────────────────────────────────────────────

  it('initializes all filter signals as empty strings', () => {
    expect(store.filterTitle()).toBe('');
    expect(store.filterAuthor()).toBe('');
    expect(store.filterGenre()).toBe('');
  });

  it('hasActiveFilters is false when all filters are empty', () => {
    expect(store.hasActiveFilters()).toBe(false);
  });

  it('hasActiveFilters is true when filterTitle is set', () => {
    TestBed.runInInjectionContext(() => store.filterTitle.set('Viento'));
    expect(store.hasActiveFilters()).toBe(true);
  });

  it('hasActiveFilters is true when filterAuthor is set', () => {
    TestBed.runInInjectionContext(() => store.filterAuthor.set('Tolkien'));
    expect(store.hasActiveFilters()).toBe(true);
  });

  it('hasActiveFilters is true when filterGenre is set', () => {
    TestBed.runInInjectionContext(() => store.filterGenre.set('Fantasía'));
    expect(store.hasActiveFilters()).toBe(true);
  });

  it('clearFilters resets all three filter signals to empty strings', () => {
    TestBed.runInInjectionContext(() => {
      store.filterTitle.set('Viento');
      store.filterAuthor.set('Tolkien');
      store.filterGenre.set('Fantasía');
    });

    store.clearFilters();

    expect(store.filterTitle()).toBe('');
    expect(store.filterAuthor()).toBe('');
    expect(store.filterGenre()).toBe('');
  });

  it('clearFilters sets hasActiveFilters back to false', () => {
    TestBed.runInInjectionContext(() => store.filterTitle.set('Algo'));
    expect(store.hasActiveFilters()).toBe(true);

    store.clearFilters();

    expect(store.hasActiveFilters()).toBe(false);
  });

  it('clearFilters resets page to 0', () => {
    store.setPage(5);
    store.clearFilters();
    expect(store.page()).toBe(0);
  });

  // ── paginación ───────────────────────────────────────────────────────────

  it('initializes page to 0', () => {
    expect(store.page()).toBe(0);
  });

  it('initializes size to 10', () => {
    expect(store.size()).toBe(10);
  });

  it('setPage updates the page signal', () => {
    store.setPage(3);
    expect(store.page()).toBe(3);
  });

  it('setSize updates the size signal and resets page to 0', () => {
    store.setPage(4);
    store.setSize(50);
    expect(store.size()).toBe(50);
    expect(store.page()).toBe(0);
  });

  // ── estado reactivo ──────────────────────────────────────────────────────

  it('books() returns empty array initially', () => {
    expect(store.books()).toEqual([]);
  });

  it('totalElements() returns 0 initially', () => {
    expect(store.totalElements()).toBe(0);
  });

  it('isLoading is true while the resource is pending', () => {
    // rxResource arranca en estado de carga hasta que el Observable resuelve
    expect(store.isLoading()).toBe(true);
  });

  it('books() returns content after resource resolves', async () => {
    vi.useFakeTimers();
    mockRepo.getAll.mockReturnValue(of(pageOfMockBooks));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        BookListStore,
        { provide: BookRepository, useValue: mockRepo },
      ],
    });
    const freshStore = TestBed.inject(BookListStore);

    // rxResource usa un scheduler interno — runAllTimers() lo avanza aunque no haya timer(300)
    vi.runAllTimers();
    await Promise.resolve();
    TestBed.flushEffects();
    vi.useRealTimers();

    expect(freshStore.books()).toEqual(MOCK_BOOKS);
  });

  it('totalElements() reflects the value from the API response', async () => {
    vi.useFakeTimers();
    const page: BookPage = { ...pageOfMockBooks, totalElements: 42, totalPages: 3, hasNext: true };
    mockRepo.getAll.mockReturnValue(of(page));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        BookListStore,
        { provide: BookRepository, useValue: mockRepo },
      ],
    });
    const freshStore = TestBed.inject(BookListStore);

    vi.runAllTimers();
    await Promise.resolve();
    TestBed.flushEffects();
    vi.useRealTimers();

    expect(freshStore.totalElements()).toBe(42);
    expect(freshStore.totalPages()).toBe(3);
    expect(freshStore.hasNext()).toBe(true);
  });
});
