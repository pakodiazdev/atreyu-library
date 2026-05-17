import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { LibroDetailComponent } from './libro-detail.component';
import { LibroDetailStore } from './libro-detail.store';

function makeStore(): LibroDetailStore {
  return {
    code:      signal(''),
    book:      signal(null),
    isLoading: signal(false),
    error:     signal(null),
    notFound:  signal(false),
    setCode:   vi.fn(),
    goBack:    vi.fn(),
  } as unknown as LibroDetailStore;
}

describe('LibroDetailComponent', () => {
  let store: LibroDetailStore;
  let mockRoute: { snapshot: { paramMap: { get: ReturnType<typeof vi.fn> } } };

  function configureAndCreate(bookSlug: string | null): LibroDetailComponent {
    store = makeStore();
    mockRoute = { snapshot: { paramMap: { get: vi.fn().mockReturnValue(bookSlug) } } };

    TestBed.configureTestingModule({
      imports: [LibroDetailComponent],
      providers: [
        { provide: LibroDetailStore, useValue: store },
        { provide: ActivatedRoute,   useValue: mockRoute },
        { provide: Router,           useValue: { navigate: vi.fn() } },
      ],
    }).overrideComponent(LibroDetailComponent, { set: { providers: [] } });

    const fixture = TestBed.createComponent(LibroDetailComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  // ── genreVariant ───────────────────────────────────────────────────────────

  describe('genreVariant()', () => {
    let component: LibroDetailComponent;
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
    let component: LibroDetailComponent;
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
      // mediodía UTC — el mismo día en cualquier huso horario (UTC-12 a UTC+12)
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
});
