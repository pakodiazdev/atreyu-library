/* eslint-disable @typescript-eslint/no-explicit-any */
import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { computed, signal } from '@angular/core';
import { vi } from 'vitest';
import { LibroListComponent } from './libro-list.component';
import { LibroListStore } from './libro-list.store';

function makeStore(): LibroListStore {
  return {
    filterTitle:      signal(''),
    filterAuthor:     signal(''),
    filterGenre:      signal(''),
    hasActiveFilters: computed(() => false),
    books:            signal([]),
    isLoading:        signal(false),
    error:            signal(null),
    clearFilters:     vi.fn(),
  } as unknown as LibroListStore;
}

describe('LibroListComponent', () => {
  let mockLocation: { replaceState: ReturnType<typeof vi.fn> };
  let mockRoute: { snapshot: { paramMap: { get: ReturnType<typeof vi.fn> } } };
  let store: LibroListStore;

  function configureAndCreate(bookSlug: string | null): LibroListComponent {
    store = makeStore();
    mockLocation = { replaceState: vi.fn() };
    mockRoute = { snapshot: { paramMap: { get: vi.fn().mockReturnValue(bookSlug) } } };

    TestBed.configureTestingModule({
      imports: [LibroListComponent],
      providers: [
        { provide: LibroListStore, useValue: store },
        { provide: Location,       useValue: mockLocation },
        { provide: ActivatedRoute, useValue: mockRoute },
      ],
    }).overrideComponent(LibroListComponent, { set: { providers: [], imports: [], template: '' } });

    const fixture = TestBed.createComponent(LibroListComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  // ── ngOnInit ───────────────────────────────────────────────────────────────

  describe('ngOnInit()', () => {
    it('no abre el drawer cuando no hay bookSlug en la ruta', () => {
      const c = configureAndCreate(null);
      expect((c as any).isDrawerOpen()).toBe(false);
      expect((c as any).drawerBookCode()).toBeNull();
    });

    it('abre el drawer al detectar bookSlug válido en la ruta', () => {
      const c = configureAndCreate('A01-cien-anos-de-soledad-1967');
      expect((c as any).isDrawerOpen()).toBe(true);
      expect((c as any).drawerBookCode()).toBe('A01');
    });

    it('no abre el drawer cuando bookSlug no tiene código válido', () => {
      const c = configureAndCreate('slug-sin-codigo');
      expect((c as any).isDrawerOpen()).toBe(false);
    });
  });

  // ── navigateTo ─────────────────────────────────────────────────────────────

  describe('navigateTo()', () => {
    it('abre el drawer y llama replaceState con la URL del libro', () => {
      const c = configureAndCreate(null);
      const book = {
        ulid: '1', code: 'B02', title: 'El Quijote',
        author: 'Cervantes', publicationYear: 1605, genre: null,
      };
      (c as any).navigateTo(book);

      expect((c as any).isDrawerOpen()).toBe(true);
      expect((c as any).drawerBookCode()).toBe('B02');
      expect(mockLocation.replaceState).toHaveBeenCalledWith(
        '/libros/cervantes/B02-el-quijote-1605'
      );
    });

    it('actualiza el código al navegar a un libro diferente', () => {
      const c = configureAndCreate('A01-cien-anos');
      const book = {
        ulid: '2', code: 'C03', title: 'Don Quijote',
        author: 'Cervantes', publicationYear: null, genre: null,
      };
      (c as any).navigateTo(book);

      expect((c as any).drawerBookCode()).toBe('C03');
    });
  });

  // ── closeDrawer ────────────────────────────────────────────────────────────

  describe('closeDrawer()', () => {
    it('cierra el drawer y llama replaceState con /catalogo', () => {
      const c = configureAndCreate('A01-slug');
      (c as any).closeDrawer();

      expect((c as any).isDrawerOpen()).toBe(false);
      expect(mockLocation.replaceState).toHaveBeenCalledWith('/catalogo');
    });
  });

  // ── genreVariant ───────────────────────────────────────────────────────────

  describe('genreVariant()', () => {
    let c: LibroListComponent;
    beforeEach(() => { c = configureAndCreate(null); });

    it('returns "default" for null', () => {
      expect((c as any).genreVariant(null)).toBe('default');
    });

    it('returns "gold" for "Fantasía"', () => {
      expect((c as any).genreVariant('Fantasía')).toBe('gold');
    });

    it('returns "moss" for "Poesía"', () => {
      expect((c as any).genreVariant('Poesía')).toBe('moss');
    });

    it('returns "default" for other genres', () => {
      expect((c as any).genreVariant('Realismo')).toBe('default');
    });
  });
});
