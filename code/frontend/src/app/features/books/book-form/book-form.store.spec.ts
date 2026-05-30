import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BookFormStore } from './book-form.store';
import { BookRepository } from '../book.repository';
import { BookCreatePayload, BookDetail } from '../book.model';
import { DrawerService } from '../../../shared/ui/drawer.service';
import { ToastService } from '../../../shared/ui/toast.service';

const PAYLOAD: BookCreatePayload = {
  title: 'El Nombre del Viento',
  author: 'Patrick Rothfuss',
  genre: 'Fantasía',
  publicationYear: 2007,
  synopsis: null,
};

const BOOK: BookDetail = {
  code: 'A01',
  ulid: '01JTEST00000000000000001',
  title: 'El Nombre del Viento',
  author: 'Patrick Rothfuss',
  genre: 'Fantasía',
  publicationYear: 2007,
};

describe('BookFormStore', () => {
  let store: BookFormStore;
  const mockRepo   = { create: vi.fn(), getByCode: vi.fn(), update: vi.fn() };
  const mockDrawer = {
    notifyBookCreated: vi.fn(),
    notifyBookUpdated: vi.fn(),
    openDetail:        vi.fn(),
    close:             vi.fn(),
  };
  const mockRouter = { navigate: vi.fn(), url: '/catalogo' };
  const mockToast  = { show: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo.create.mockReturnValue(of(BOOK));
    mockRepo.getByCode.mockReturnValue(of(BOOK));
    mockRepo.update.mockReturnValue(of(BOOK));

    TestBed.configureTestingModule({
      providers: [
        BookFormStore,
        { provide: BookRepository, useValue: mockRepo },
        { provide: DrawerService,  useValue: mockDrawer },
        { provide: Router,         useValue: mockRouter },
        { provide: ToastService,   useValue: mockToast },
      ],
    });
    store = TestBed.inject(BookFormStore);
  });

  // ── estado inicial ──────────────────────────────────────────────────────────

  it('initializes isSubmitting as false', () => {
    expect(store.isSubmitting()).toBe(false);
  });

  it('initializes fieldErrors as empty object', () => {
    expect(store.fieldErrors()).toEqual({});
  });

  it('initializes submitError as null', () => {
    expect(store.submitError()).toBeNull();
  });

  it('initializes isEditMode as false', () => {
    expect(store.isEditMode()).toBe(false);
  });

  it('initializes editedBook as null', () => {
    expect(store.editedBook()).toBeNull();
  });

  // ── setBookCode() ──────────────────────────────────────────────────────────

  describe('setBookCode()', () => {
    it('activa isEditMode cuando se provee un código', () => {
      store.setBookCode('A01');
      expect(store.isEditMode()).toBe(true);
    });

    it('desactiva isEditMode cuando se provee null', () => {
      store.setBookCode('A01');
      store.setBookCode(null);
      expect(store.isEditMode()).toBe(false);
    });
  });

  // ── cancel() ───────────────────────────────────────────────────────────────

  describe('cancel()', () => {
    it('cierra el drawer en modo creación', () => {
      store.cancel();
      expect(mockDrawer.close).toHaveBeenCalled();
    });

    it('abre el detalle en modo edición', () => {
      store.setBookCode('A01');
      store.cancel();
      expect(mockDrawer.openDetail).toHaveBeenCalledWith('A01');
    });
  });

  // ── submit() — modo creación ───────────────────────────────────────────────

  describe('submit() — create mode (no bookCode)', () => {
    it('calls repo.create with the payload', () => {
      store.submit(PAYLOAD);
      expect(mockRepo.create).toHaveBeenCalledWith(PAYLOAD);
    });

    it('notifica al drawer que se creó un libro', () => {
      store.submit(PAYLOAD);
      expect(mockDrawer.notifyBookCreated).toHaveBeenCalled();
    });

    it('navega a /catalogo con queryParam title, limpia nuevo-libro y usa replaceUrl tras la creación exitosa', () => {
      store.submit(PAYLOAD);
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/catalogo'],
        {
          queryParams: { title: BOOK.title, 'nuevo-libro': null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        },
      );
    });

    it('muestra toast con el título del libro creado', () => {
      store.submit(PAYLOAD);
      expect(mockToast.show).toHaveBeenCalledWith(
        `"${BOOK.title}" añadido al catálogo`,
        'success',
        400,
      );
    });

    it('resets isSubmitting to false on success', () => {
      store.submit(PAYLOAD);
      expect(store.isSubmitting()).toBe(false);
    });

    it('clears fieldErrors before submitting', () => {
      const err422 = new HttpErrorResponse({
        status: 422, error: { errors: { title: 'obligatorio' } },
      });
      mockRepo.create.mockReturnValueOnce(throwError(() => err422));
      store.submit(PAYLOAD);

      mockRepo.create.mockReturnValue(of(BOOK));
      store.submit(PAYLOAD);

      expect(store.fieldErrors()).toEqual({});
    });

    it('clears submitError before submitting', () => {
      const err500 = new HttpErrorResponse({ status: 500 });
      mockRepo.create.mockReturnValueOnce(throwError(() => err500));
      store.submit(PAYLOAD);

      mockRepo.create.mockReturnValue(of(BOOK));
      store.submit(PAYLOAD);

      expect(store.submitError()).toBeNull();
    });

    it('sets fieldErrors on 422', () => {
      const err = new HttpErrorResponse({
        status: 422,
        error: { errors: { title: 'El título es obligatorio' } },
      });
      mockRepo.create.mockReturnValue(throwError(() => err));
      store.submit(PAYLOAD);
      expect(store.fieldErrors()).toEqual({ title: 'El título es obligatorio' });
    });

    it('sets submitError on generic server error', () => {
      const err = new HttpErrorResponse({ status: 500 });
      mockRepo.create.mockReturnValue(throwError(() => err));
      store.submit(PAYLOAD);
      expect(store.submitError()).not.toBeNull();
    });

    it('does not call notifyBookCreated on 422', () => {
      const err = new HttpErrorResponse({
        status: 422, error: { errors: { title: 'obligatorio' } },
      });
      mockRepo.create.mockReturnValue(throwError(() => err));
      store.submit(PAYLOAD);
      expect(mockDrawer.notifyBookCreated).not.toHaveBeenCalled();
    });
  });

  // ── submit() — modo edición ────────────────────────────────────────────────

  describe('submit() — edit mode (bookCode set)', () => {
    beforeEach(() => {
      store.setBookCode('A01');
      TestBed.flushEffects();
    });

    it('calls repo.update (not repo.create) when in edit mode', () => {
      store.submit(PAYLOAD);
      expect(mockRepo.update).toHaveBeenCalled();
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('calls repo.update with the book ulid and payload', () => {
      store.submit(PAYLOAD);
      expect(mockRepo.update).toHaveBeenCalledWith(BOOK.ulid, PAYLOAD);
    });

    it('calls drawer.notifyBookUpdated on success', () => {
      store.submit(PAYLOAD);
      expect(mockDrawer.notifyBookUpdated).toHaveBeenCalled();
    });

    it('does not navigate after update', () => {
      store.submit(PAYLOAD);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('resets isSubmitting to false on success', () => {
      store.submit(PAYLOAD);
      expect(store.isSubmitting()).toBe(false);
    });

    it('sets fieldErrors on 422', () => {
      const err = new HttpErrorResponse({
        status: 422,
        error: { errors: { author: 'Requerido' } },
      });
      mockRepo.update.mockReturnValue(throwError(() => err));
      store.submit(PAYLOAD);
      expect(store.fieldErrors()).toEqual({ author: 'Requerido' });
    });

    it('sets submitError on generic server error', () => {
      const err = new HttpErrorResponse({ status: 500 });
      mockRepo.update.mockReturnValue(throwError(() => err));
      store.submit(PAYLOAD);
      expect(store.submitError()).not.toBeNull();
    });

    it('sets isSubmitting to false on error', () => {
      const err = new HttpErrorResponse({ status: 503 });
      mockRepo.update.mockReturnValue(throwError(() => err));
      store.submit(PAYLOAD);
      expect(store.isSubmitting()).toBe(false);
    });
  });
});
