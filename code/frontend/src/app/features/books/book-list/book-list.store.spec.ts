import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { BookListStore } from './book-list.store';
import { BookRepository } from '../book.repository';
import { Book } from '../book.model';

const MOCK_BOOKS: Book[] = [
  { code: 'A01', ulid: '01', title: 'El Nombre del Viento', author: 'Patrick Rothfuss', genre: 'Fantasía', publicationYear: 2007 },
];

describe('BookListStore', () => {
  let store: BookListStore;
  const mockRepo = { getAll: vi.fn().mockReturnValue(of([])) };

  beforeEach(() => {
    mockRepo.getAll.mockReturnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        BookListStore,
        { provide: BookRepository, useValue: mockRepo },
      ],
    });
    store = TestBed.inject(BookListStore);
  });

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

  it('books() returns empty array initially', () => {
    expect(store.books()).toEqual([]);
  });

  it('isLoading is true while the resource is pending', () => {
    // rxResource arranca en estado de carga hasta que el Observable resuelve
    expect(store.isLoading()).toBe(true);
  });

  it('books() returns data after resource resolves', async () => {
    vi.useFakeTimers();
    mockRepo.getAll.mockReturnValue(of(MOCK_BOOKS));

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
});
