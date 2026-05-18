import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { BookDeleteFormStore } from './book-delete-form.store';
import { BookRepository } from '../book.repository';
import { DialogService } from '../../../shared/ui/dialog.service';
import { DrawerService } from '../../../shared/ui/drawer.service';
import { ToastService } from '../../../shared/ui/toast.service';

const BOOK_CODE = 'ABK2';
const BOOK_ULID = '01JTEST00000000000000001';

function makeDialog(code = BOOK_CODE, ulid = BOOK_ULID) {
  return {
    bookCode:          signal<string | null>(code),
    bookUlid:          signal<string | null>(ulid),
    close:             vi.fn(),
    notifyBookDeleted: vi.fn(),
  };
}

describe('BookDeleteFormStore', () => {
  let store:      BookDeleteFormStore;
  let mockDialog: ReturnType<typeof makeDialog>;
  const mockRepo   = { delete: vi.fn() };
  const mockDrawer = { close: vi.fn() };
  const mockRouter = { navigate: vi.fn() };
  const mockToast  = { show: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo.delete.mockReturnValue(of(undefined));
    mockDialog = makeDialog();

    TestBed.configureTestingModule({
      providers: [
        BookDeleteFormStore,
        { provide: BookRepository, useValue: mockRepo },
        { provide: DialogService,  useValue: mockDialog },
        { provide: DrawerService,  useValue: mockDrawer },
        { provide: Router,         useValue: mockRouter },
        { provide: ToastService,   useValue: mockToast },
      ],
    });
    store = TestBed.inject(BookDeleteFormStore);
  });

  // ── estado inicial ──────────────────────────────────────────────────────────

  it('initializes isSubmitting as false', () => {
    expect(store.isSubmitting()).toBe(false);
  });

  it('initializes submitError as null', () => {
    expect(store.submitError()).toBeNull();
  });

  it('initializes codeError as null', () => {
    expect(store.codeError()).toBeNull();
  });

  it('exposes bookCode from dialog service', () => {
    expect(store.bookCode()).toBe(BOOK_CODE);
  });

  it('exposes bookUlid from dialog service', () => {
    expect(store.bookUlid()).toBe(BOOK_ULID);
  });

  // ── cancel() ───────────────────────────────────────────────────────────────

  describe('cancel()', () => {
    it('cierra el dialog', () => {
      store.cancel();
      expect(mockDialog.close).toHaveBeenCalled();
    });
  });

  // ── submit() — validación de código ────────────────────────────────────────

  describe('submit() — wrong code', () => {
    it('sets codeError when entered code does not match', () => {
      store.submit('WRONG');
      expect(store.codeError()).not.toBeNull();
    });

    it('does not call repo.delete when code does not match', () => {
      store.submit('WRONG');
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it('does not set isSubmitting when code does not match', () => {
      store.submit('WRONG');
      expect(store.isSubmitting()).toBe(false);
    });
  });

  // ── submit() — happy path ──────────────────────────────────────────────────

  describe('submit() — success', () => {
    it('calls repo.delete with the book ULID', () => {
      store.submit(BOOK_CODE);
      expect(mockRepo.delete).toHaveBeenCalledWith(BOOK_ULID);
    });

    it('notifica al dialog que se eliminó el libro', () => {
      store.submit(BOOK_CODE);
      expect(mockDialog.notifyBookDeleted).toHaveBeenCalled();
    });

    it('cierra el drawer tras eliminar', () => {
      store.submit(BOOK_CODE);
      expect(mockDrawer.close).toHaveBeenCalled();
    });

    it('navega a /catalogo tras la eliminación exitosa', () => {
      store.submit(BOOK_CODE);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/catalogo']);
    });

    it('resets isSubmitting to false on success', () => {
      store.submit(BOOK_CODE);
      expect(store.isSubmitting()).toBe(false);
    });

    it('clears codeError before submitting', () => {
      store.submit('WRONG');
      store.submit(BOOK_CODE);
      expect(store.codeError()).toBeNull();
    });

    it('clears submitError before submitting', () => {
      const err500 = new HttpErrorResponse({ status: 500 });
      mockRepo.delete.mockReturnValueOnce(throwError(() => err500));
      store.submit(BOOK_CODE);

      mockRepo.delete.mockReturnValue(of(undefined));
      store.submit(BOOK_CODE);

      expect(store.submitError()).toBeNull();
    });
  });

  // ── submit() — error 404 ───────────────────────────────────────────────────

  describe('submit() — 404 not found', () => {
    it('sets specific submitError on 404', () => {
      const err = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      mockRepo.delete.mockReturnValue(throwError(() => err));

      store.submit(BOOK_CODE);

      expect(store.submitError()).toContain('ya no existe');
    });

    it('sets isSubmitting to false after 404', () => {
      const err = new HttpErrorResponse({ status: 404 });
      mockRepo.delete.mockReturnValue(throwError(() => err));

      store.submit(BOOK_CODE);

      expect(store.isSubmitting()).toBe(false);
    });

    it('does not call notifyBookDeleted on 404', () => {
      const err = new HttpErrorResponse({ status: 404 });
      mockRepo.delete.mockReturnValue(throwError(() => err));

      store.submit(BOOK_CODE);

      expect(mockDialog.notifyBookDeleted).not.toHaveBeenCalled();
    });
  });

  // ── submit() — error genérico ──────────────────────────────────────────────

  describe('submit() — generic server error', () => {
    it('sets submitError on non-404 HTTP error', () => {
      const err = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
      mockRepo.delete.mockReturnValue(throwError(() => err));

      store.submit(BOOK_CODE);

      expect(store.submitError()).not.toBeNull();
    });

    it('sets isSubmitting to false after server error', () => {
      const err = new HttpErrorResponse({ status: 503 });
      mockRepo.delete.mockReturnValue(throwError(() => err));

      store.submit(BOOK_CODE);

      expect(store.isSubmitting()).toBe(false);
    });

    it('does not navigate on error', () => {
      const err = new HttpErrorResponse({ status: 500 });
      mockRepo.delete.mockReturnValue(throwError(() => err));

      store.submit(BOOK_CODE);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  // ── submit() — ulid nulo (guard) ───────────────────────────────────────────

  describe('submit() — no ulid guard', () => {
    it('does not call repo.delete when ulid is null', () => {
      const dialogWithoutUlid = makeDialog(BOOK_CODE, null as unknown as string);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          BookDeleteFormStore,
          { provide: BookRepository, useValue: mockRepo },
          { provide: DialogService,  useValue: dialogWithoutUlid },
          { provide: DrawerService,  useValue: mockDrawer },
          { provide: Router,         useValue: mockRouter },
          { provide: ToastService,   useValue: mockToast },
        ],
      });
      const guardStore = TestBed.inject(BookDeleteFormStore);

      guardStore.submit(BOOK_CODE);

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });

  // ── submit() — toast en error ──────────────────────────────────────────────

  describe('submit() — toast on error', () => {
    it('emite toast de error en 404', () => {
      const err = new HttpErrorResponse({ status: 404 });
      mockRepo.delete.mockReturnValue(throwError(() => err));

      store.submit(BOOK_CODE);

      expect(mockToast.show).toHaveBeenCalledWith(expect.stringContaining('ya no existe'), 'error');
    });

    it('emite toast de error genérico en 500', () => {
      const err = new HttpErrorResponse({ status: 500 });
      mockRepo.delete.mockReturnValue(throwError(() => err));

      store.submit(BOOK_CODE);

      expect(mockToast.show).toHaveBeenCalledWith(expect.stringContaining('No se pudo eliminar'), 'error');
    });
  });
});
