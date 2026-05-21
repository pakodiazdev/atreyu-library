import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { computed, signal } from '@angular/core';
import { vi } from 'vitest';
import { InicioComponent } from './inicio.component';
import { InicioStore } from './inicio.store';
import { DrawerService } from '../../shared/ui/drawer.service';

function makeStore(): InicioStore {
  return {
    stats:           signal(null),
    recentBooks:     signal([]),
    activity:        signal([]),
    genres:          signal([]),
    statsLoading:    signal(false),
    booksLoading:    signal(false),
    activityLoading: signal(false),
    genresLoading:   signal(false),
    statsError:      signal(null),
    booksError:      signal(null),
    activityError:   signal(null),
    genresError:     signal(null),
  } as unknown as InicioStore;
}

function makeDrawer() {
  return {
    openDetail:     vi.fn(),
    openDetailFrom: vi.fn(),
    openForm:       vi.fn(),
    close:          vi.fn(),
    isOpen:         computed(() => false),
    mode:           signal(null),
    bookCode:       signal(null),
    bookCreated:    signal(0),
    updateCount:    signal(0),
    returnUrl:      signal('/inicio'),
  } as unknown as DrawerService;
}

function configure(bookSlug: string | null) {
  const store  = makeStore();
  const drawer = makeDrawer();
  const mockLocation = { replaceState: vi.fn() };
  const mockRoute = {
    snapshot: {
      paramMap: { get: vi.fn().mockReturnValue(bookSlug) },
    },
  };

  TestBed.configureTestingModule({
    imports: [InicioComponent],
    providers: [
      { provide: InicioStore,    useValue: store   },
      { provide: DrawerService,  useValue: drawer  },
      { provide: Location,       useValue: mockLocation },
      { provide: ActivatedRoute, useValue: mockRoute   },
    ],
  }).overrideComponent(InicioComponent, { set: { providers: [], imports: [], template: '' } });

  const fixture = TestBed.createComponent(InicioComponent);
  fixture.detectChanges();
  return { fixture, drawer, mockLocation };
}

describe('InicioComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('ngOnInit()', () => {
    it('does not open drawer when no bookSlug in route', () => {
      const { drawer } = configure(null);
      expect(drawer.openDetailFrom).not.toHaveBeenCalled();
    });

    it('opens drawer with correct code when bookSlug is valid', () => {
      const { drawer } = configure('A01-el-quijote-1605');
      expect(drawer.openDetailFrom).toHaveBeenCalledWith('A01', '/inicio');
    });

    it('does not open drawer when bookSlug has no valid code', () => {
      const { drawer } = configure('slug-sin-codigo');
      expect(drawer.openDetailFrom).not.toHaveBeenCalled();
    });
  });

  describe('openDetail()', () => {
    it('calls openDetailFrom with book code and /inicio', () => {
      const { fixture, drawer } = configure(null);
      const c = fixture.componentInstance;
      const book = { ulid: '1', code: 'B02', title: 'El Quijote', author: 'Cervantes', publicationYear: 1605, genre: null };

      (c as unknown as { openDetail(b: typeof book): void }).openDetail(book);

      expect(drawer.openDetailFrom).toHaveBeenCalledWith('B02', '/inicio');
    });

    it('calls location.replaceState with the book URL', () => {
      const { fixture, mockLocation } = configure(null);
      const c = fixture.componentInstance;
      const book = { ulid: '1', code: 'B02', title: 'El Quijote', author: 'Cervantes', publicationYear: 1605, genre: null };

      (c as unknown as { openDetail(b: typeof book): void }).openDetail(book);

      expect(mockLocation.replaceState).toHaveBeenCalledWith(
        expect.stringContaining('/inicio/libros/')
      );
    });
  });
});
