import { Location } from '@angular/common';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { computed, signal, WritableSignal } from '@angular/core';
import { vi } from 'vitest';
import { BookListComponent } from './book-list.component';
import { BookListStore } from './book-list.store';
import { DrawerService } from '../../../shared/ui/drawer.service';
import { DialogService } from '../../../shared/ui/dialog.service';
import { Book } from '../book.model';

function makeStore(): BookListStore {
  return {
    filterTitle:      signal(''),
    filterAuthor:     signal(''),
    filterGenre:      signal(''),
    hasActiveFilters: computed(() => false),
    books:            signal([]),
    isLoading:        signal(false),
    error:            signal(null),
    clearFilters:     vi.fn(),
    reload:           vi.fn(),
  } as unknown as BookListStore;
}

function makeDrawer() {
  return {
    openDetail:      vi.fn(),
    openForm:        vi.fn(),
    close:           vi.fn(),
    isOpen:          signal(false),
    mode:            signal(null),
    bookCode:        signal(null),
    bookCreated:     signal(0),
    updateCount:     signal(0),
  } as unknown as DrawerService;
}

describe('BookListComponent', () => {
  let mockLocation: { replaceState: ReturnType<typeof vi.fn> };
  let mockRoute: { snapshot: { paramMap: { get: ReturnType<typeof vi.fn> } } };
  let store: BookListStore;
  let drawer: ReturnType<typeof makeDrawer>;
  let fixture: ComponentFixture<BookListComponent>;

  function configureAndCreate(bookSlug: string | null): BookListComponent {
    store  = makeStore();
    drawer = makeDrawer();
    mockLocation = { replaceState: vi.fn() };
    mockRoute    = { snapshot: { paramMap: { get: vi.fn().mockReturnValue(bookSlug) } } };

    TestBed.configureTestingModule({
      imports: [BookListComponent],
      providers: [
        { provide: BookListStore,  useValue: store },
        { provide: DrawerService,   useValue: drawer },
        { provide: Location,        useValue: mockLocation },
        { provide: ActivatedRoute,  useValue: mockRoute },
      ],
    }).overrideComponent(BookListComponent, { set: { providers: [], imports: [], template: '' } });

    fixture = TestBed.createComponent(BookListComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  // ── ngOnInit ───────────────────────────────────────────────────────────────

  describe('ngOnInit()', () => {
    it('no abre el drawer cuando no hay bookSlug en la ruta', () => {
      configureAndCreate(null);
      expect(drawer.openDetail).not.toHaveBeenCalled();
    });

    it('abre el drawer de detalle al detectar bookSlug válido en la ruta', () => {
      configureAndCreate('A01-cien-anos-de-soledad-1967');
      expect(drawer.openDetail).toHaveBeenCalledWith('A01');
    });

    it('no abre el drawer cuando bookSlug no tiene código válido', () => {
      configureAndCreate('slug-sin-codigo');
      expect(drawer.openDetail).not.toHaveBeenCalled();
    });
  });

  // ── openDetail ─────────────────────────────────────────────────────────────

  describe('openDetail()', () => {
    it('llama a drawer.openDetail con el código del libro', () => {
      const c = configureAndCreate(null);
      const book = {
        ulid: '1', code: 'B02', title: 'El Quijote',
        author: 'Cervantes', publicationYear: 1605, genre: null,
      };
      (c as unknown as { openDetail(b: typeof book): void }).openDetail(book);

      expect(drawer.openDetail).toHaveBeenCalledWith('B02');
    });

    it('llama a replaceState con la URL del libro', () => {
      const c = configureAndCreate(null);
      const book = {
        ulid: '1', code: 'B02', title: 'El Quijote',
        author: 'Cervantes', publicationYear: 1605, genre: null,
      };
      (c as unknown as { openDetail(b: typeof book): void }).openDetail(book);

      expect(mockLocation.replaceState).toHaveBeenCalledWith(
        '/libros/cervantes/B02-el-quijote-1605'
      );
    });
  });

  // ── genreVariant ───────────────────────────────────────────────────────────

  describe('genreVariant()', () => {
    let c: BookListComponent;
    beforeEach(() => { c = configureAndCreate(null); });

    it('returns "default" for null', () => {
      expect((c as unknown as { genreVariant(g: null): string }).genreVariant(null)).toBe('default');
    });

    it('returns "gold" for "Fantasía"', () => {
      expect((c as unknown as { genreVariant(g: string): string }).genreVariant('Fantasía')).toBe('gold');
    });

    it('returns "moss" for "Poesía"', () => {
      expect((c as unknown as { genreVariant(g: string): string }).genreVariant('Poesía')).toBe('moss');
    });

    it('returns "default" for other genres', () => {
      expect((c as unknown as { genreVariant(g: string): string }).genreVariant('Realismo')).toBe('default');
    });
  });

  // ── bookCreated → reload ────────────────────────────────────────────────────

  describe('bookCreated → store.reload()', () => {
    it('llama a store.reload() cuando bookCreated se incrementa después del montaje', () => {
      configureAndCreate(null);
      (drawer.bookCreated as unknown as WritableSignal<number>).set(1);
      fixture.detectChanges();
      expect(store.reload).toHaveBeenCalled();
    });

    it('no llama a store.reload() al montar con bookCreated inicial en 0', () => {
      configureAndCreate(null);
      // Effect ya corrió en detectChanges() con bookCreated = 0 = initialCreated → sin reload
      expect(store.reload).not.toHaveBeenCalled();
    });
  });

  // ── template rendering ─────────────────────────────────────────────────────

  describe('template rendering', () => {
    afterEach(() => TestBed.resetTestingModule());

    function createWithState(state: {
      isLoading?: boolean;
      error?: string | null;
      books?: Book[];
      hasActiveFilters?: boolean;
    } = {}): ComponentFixture<BookListComponent> {
      const s: BookListStore = {
        filterTitle:      signal(''),
        filterAuthor:     signal(''),
        filterGenre:      signal(''),
        hasActiveFilters: computed(() => state.hasActiveFilters ?? false),
        books:            signal(state.books ?? []),
        isLoading:        signal(state.isLoading ?? false),
        error:            signal(state.error ?? null),
        clearFilters:     vi.fn(),
        reload:           vi.fn(),
      } as unknown as BookListStore;

      TestBed.configureTestingModule({
        imports: [BookListComponent],
        providers: [
          { provide: DrawerService,  useValue: makeDrawer() },
          { provide: DialogService,  useValue: { bookDeleted: signal(0) } },
          { provide: Location,       useValue: { replaceState: vi.fn() } },
          { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: vi.fn().mockReturnValue(null) } } } },
        ],
      }).overrideProvider(BookListStore, { useValue: s });

      const f = TestBed.createComponent(BookListComponent);
      f.detectChanges();
      return f;
    }

    it('renders loading skeleton', () => {
      const f = createWithState({ isLoading: true });
      expect(f.nativeElement.querySelector('table')).toBeTruthy();
      expect(f.nativeElement.querySelector('[data-cy="error-state"]')).toBeNull();
    });

    it('renders error state', () => {
      const f = createWithState({ error: 'Server error' });
      expect(f.nativeElement.querySelector('[data-cy="error-state"]')).toBeTruthy();
    });

    it('renders empty state without active filters', () => {
      const f = createWithState({ books: [] });
      expect(f.nativeElement.querySelector('[data-cy="empty-state"]')).toBeTruthy();
      expect(f.nativeElement.querySelector('[data-cy="clear-filters"]')).toBeNull();
    });

    it('renders empty state with active filters and limpiar button', () => {
      const f = createWithState({ books: [], hasActiveFilters: true });
      const emptyState = f.nativeElement.querySelector('[data-cy="empty-state"]');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('Ningún título');
      expect(f.nativeElement.querySelector('[data-cy="clear-filters"]')).toBeTruthy();
    });

    it('renders books table with rows', () => {
      const books: Book[] = [{
        ulid: '1', code: 'A01', title: 'Cien años de soledad',
        author: 'García Márquez', publicationYear: 1967, genre: 'Realismo mágico',
      }];
      const f = createWithState({ books });
      expect(f.nativeElement.querySelector('[data-cy="books-table"]')).toBeTruthy();
      expect(f.nativeElement.querySelectorAll('[data-cy="book-row"]')).toHaveLength(1);
    });

    it('renders dash for book without genre', () => {
      const books: Book[] = [{
        ulid: '1', code: 'A01', title: 'Test', author: 'Author',
        publicationYear: null, genre: null,
      }];
      const f = createWithState({ books });
      const row = f.nativeElement.querySelector('[data-cy="book-row"]');
      expect(row.textContent).toContain('—');
    });

    it('shows clear-filters button when hasActiveFilters is true with books', () => {
      const books: Book[] = [{
        ulid: '1', code: 'A01', title: 'T', author: 'A', publicationYear: 2020, genre: 'Fantasía',
      }];
      const f = createWithState({ books, hasActiveFilters: true });
      expect(f.nativeElement.querySelector('[data-cy="clear-filters"]')).toBeTruthy();
    });
  });
});
