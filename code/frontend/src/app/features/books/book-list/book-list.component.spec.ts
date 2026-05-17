import { Location } from '@angular/common';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { computed, signal, WritableSignal } from '@angular/core';
import { vi } from 'vitest';
import { BookListComponent } from './book-list.component';
import { BookListStore } from './book-list.store';
import { DrawerService } from '../../../shared/ui/drawer.service';

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
});
