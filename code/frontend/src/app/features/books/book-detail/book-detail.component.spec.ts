import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { BookDetailComponent } from './book-detail.component';
import { BookDetailStore } from './book-detail.store';
import { DrawerService } from '../../../shared/ui/drawer.service';
import { BookDetail } from '../book.model';

const MOCK_BOOK: BookDetail = {
  code: 'A01',
  ulid: '01JTEST00000000000000001',
  title: 'El Nombre del Viento',
  author: 'Patrick Rothfuss',
  genre: 'Fantasía',
  publicationYear: 2007,
};

function makeStore(): BookDetailStore {
  return {
    code:      signal(''),
    book:      signal(null),
    isLoading: signal(false),
    error:     signal(null),
    notFound:  signal(false),
    setCode:   vi.fn(),
    goBack:    vi.fn(),
    reload:    vi.fn(),
  } as unknown as BookDetailStore;
}

describe('BookDetailComponent', () => {
  let store: BookDetailStore;
  let mockDrawer: { openEdit: ReturnType<typeof vi.fn>; updateCount: ReturnType<typeof signal<number>> };
  let mockRoute: { snapshot: { paramMap: { get: ReturnType<typeof vi.fn> } } };

  function configureAndCreate(bookSlug: string | null): BookDetailComponent {
    store      = makeStore();
    mockDrawer = { openEdit: vi.fn(), updateCount: signal(0) };
    mockRoute  = { snapshot: { paramMap: { get: vi.fn().mockReturnValue(bookSlug) } } };

    TestBed.configureTestingModule({
      imports: [BookDetailComponent],
      providers: [
        { provide: BookDetailStore, useValue: store },
        { provide: ActivatedRoute,   useValue: mockRoute },
        { provide: Router,           useValue: { navigate: vi.fn() } },
        { provide: DrawerService,    useValue: mockDrawer },
      ],
    }).overrideComponent(BookDetailComponent, { set: { providers: [] } });

    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  // ── genreVariant ───────────────────────────────────────────────────────────

  describe('genreVariant()', () => {
    let component: BookDetailComponent;
    beforeEach(() => { component = configureAndCreate(''); });

    it('returns "default" for null genre', () => {
      expect(component.genreVariant(null)).toBe('default');
    });

    it('returns "gold" for "Fantasía"', () => {
      expect(component.genreVariant('Fantasía')).toBe('gold');
    });

    it('returns "gold" for uppercase "FANTASÍA"', () => {
      expect(component.genreVariant('FANTASÍA')).toBe('gold');
    });

    it('returns "moss" for "Poesía"', () => {
      expect(component.genreVariant('Poesía')).toBe('moss');
    });

    it('returns "moss" for lowercase "poesia"', () => {
      expect(component.genreVariant('poesia')).toBe('moss');
    });

    it('returns "default" for any other genre', () => {
      expect(component.genreVariant('Realismo mágico')).toBe('default');
      expect(component.genreVariant('Épica')).toBe('default');
      expect(component.genreVariant('Terror')).toBe('default');
    });
  });

  // ── formatDate ─────────────────────────────────────────────────────────────

  describe('formatDate()', () => {
    let component: BookDetailComponent;
    beforeEach(() => { component = configureAndCreate(''); });

    it('returns "—" for undefined', () => {
      expect(component.formatDate(undefined)).toBe('—');
    });

    it('returns "—" for empty string', () => {
      expect(component.formatDate('')).toBe('—');
    });

    it('returns "—" for invalid date string', () => {
      expect(component.formatDate('not-a-date')).toBe('—');
    });

    it('formats a valid ISO date to Spanish locale', () => {
      const result = component.formatDate('2026-01-15T12:00:00Z');
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2026/);
    });
  });

  // ── ngOnInit ───────────────────────────────────────────────────────────────

  describe('ngOnInit()', () => {
    it('extracts code from bookSlug param and calls store.setCode()', () => {
      configureAndCreate('A01-cien-anos-de-soledad-1967');
      expect(mockRoute.snapshot.paramMap.get).toHaveBeenCalledWith('bookSlug');
      expect(store.setCode).toHaveBeenCalledWith('A01');
    });

    it('calls store.setCode with empty string when bookSlug has no valid code', () => {
      configureAndCreate('invalid-slug');
      expect(store.setCode).toHaveBeenCalledWith('');
    });

    it('calls store.setCode with empty string when route param is null', () => {
      configureAndCreate(null);
      expect(store.setCode).toHaveBeenCalledWith('');
    });
  });

  // ── @Input bookCode ────────────────────────────────────────────────────────

  describe('@Input bookCode', () => {
    it('llama a store.setCode con el valor del input cuando se provee', () => {
      store      = makeStore();
      mockDrawer = { openEdit: vi.fn(), updateCount: signal(0) };
      mockRoute  = { snapshot: { paramMap: { get: vi.fn().mockReturnValue(null) } } };

      TestBed.configureTestingModule({
        imports: [BookDetailComponent],
        providers: [
          { provide: BookDetailStore, useValue: store },
          { provide: ActivatedRoute,   useValue: mockRoute },
          { provide: Router,           useValue: { navigate: vi.fn() } },
          { provide: DrawerService,    useValue: mockDrawer },
        ],
      }).overrideComponent(BookDetailComponent, { set: { providers: [] } });

      const fixture = TestBed.createComponent(BookDetailComponent);
      fixture.componentRef.setInput('bookCode', 'B03');
      fixture.detectChanges();

      expect(store.setCode).toHaveBeenCalledWith('B03');
    });

    it('no llama a store.setCode desde ngOnInit cuando bookCode input está presente', () => {
      store      = makeStore();
      mockDrawer = { openEdit: vi.fn(), updateCount: signal(0) };
      mockRoute  = { snapshot: { paramMap: { get: vi.fn().mockReturnValue('A01-slug') } } };

      TestBed.configureTestingModule({
        imports: [BookDetailComponent],
        providers: [
          { provide: BookDetailStore, useValue: store },
          { provide: ActivatedRoute,   useValue: mockRoute },
          { provide: Router,           useValue: { navigate: vi.fn() } },
          { provide: DrawerService,    useValue: mockDrawer },
        ],
      }).overrideComponent(BookDetailComponent, { set: { providers: [] } });

      const fixture = TestBed.createComponent(BookDetailComponent);
      fixture.componentRef.setInput('bookCode', 'B03');
      fixture.detectChanges();

      expect(store.setCode).toHaveBeenCalledTimes(1);
      expect(store.setCode).toHaveBeenCalledWith('B03');
    });

    it('ignora bookCode null o undefined y no cambia el estado', () => {
      store      = makeStore();
      mockDrawer = { openEdit: vi.fn(), updateCount: signal(0) };
      mockRoute  = { snapshot: { paramMap: { get: vi.fn().mockReturnValue(null) } } };

      TestBed.configureTestingModule({
        imports: [BookDetailComponent],
        providers: [
          { provide: BookDetailStore, useValue: store },
          { provide: ActivatedRoute,   useValue: mockRoute },
          { provide: Router,           useValue: { navigate: vi.fn() } },
          { provide: DrawerService,    useValue: mockDrawer },
        ],
      }).overrideComponent(BookDetailComponent, { set: { providers: [] } });

      const fixture = TestBed.createComponent(BookDetailComponent);
      fixture.componentRef.setInput('bookCode', null);
      fixture.detectChanges();

      expect(store.setCode).toHaveBeenCalledWith('');
    });
  });

  // ── openEdit() ─────────────────────────────────────────────────────────────

  describe('openEdit()', () => {
    it('llama a drawer.openEdit con el código del libro', () => {
      const component = configureAndCreate('');
      component.openEdit(MOCK_BOOK);
      expect(mockDrawer.openEdit).toHaveBeenCalledWith('A01');
    });
  });
});
