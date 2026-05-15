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

  function configureAndCreate(ulid: string | null) {
    store = makeStore();
    mockRoute = { snapshot: { paramMap: { get: vi.fn().mockReturnValue(ulid) } } };

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
      expect((component as any).genreVariant(null)).toBe('default');
    });

    it('returns "gold" for "Fantasía"', () => {
      expect((component as any).genreVariant('Fantasía')).toBe('gold');
    });

    it('returns "gold" for uppercase "FANTASÍA"', () => {
      expect((component as any).genreVariant('FANTASÍA')).toBe('gold');
    });

    it('returns "moss" for "Poesía"', () => {
      expect((component as any).genreVariant('Poesía')).toBe('moss');
    });

    it('returns "moss" for lowercase "poesia"', () => {
      expect((component as any).genreVariant('poesia')).toBe('moss');
    });

    it('returns "default" for any other genre', () => {
      expect((component as any).genreVariant('Realismo mágico')).toBe('default');
      expect((component as any).genreVariant('Épica')).toBe('default');
      expect((component as any).genreVariant('Terror')).toBe('default');
    });
  });

  // ── formatDate ─────────────────────────────────────────────────────────────

  describe('formatDate()', () => {
    let component: LibroDetailComponent;
    beforeEach(() => { component = configureAndCreate(''); });

    it('returns "—" for undefined', () => {
      expect((component as any).formatDate(undefined)).toBe('—');
    });

    it('returns "—" for empty string', () => {
      expect((component as any).formatDate('')).toBe('—');
    });

    it('returns "—" for invalid date string', () => {
      expect((component as any).formatDate('not-a-date')).toBe('—');
    });

    it('formats a valid ISO date to Spanish locale', () => {
      const result = (component as any).formatDate('2026-01-15T00:00:00Z');
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2026/);
    });
  });

  // ── ngOnInit ───────────────────────────────────────────────────────────────

  describe('ngOnInit()', () => {
    it('extracts code from bookSlug param and calls store.setCode()', () => {
      const component = configureAndCreate('A01-cien-anos-de-soledad-1967');
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
