import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LibroFormStore } from './libro-form.store';
import { BookRepository } from '../book.repository';
import { BookCreatePayload, BookDetail } from '../book.model';

const PAYLOAD: BookCreatePayload = {
  title: 'El Nombre del Viento',
  author: 'Patrick Rothfuss',
  genre: 'Fantasía',
  publicationYear: 2007,
  synopsis: null,
};

const CREATED: BookDetail = {
  code: 'A01',
  ulid: '01JTEST00000000000000001',
  title: 'El Nombre del Viento',
  author: 'Patrick Rothfuss',
  genre: 'Fantasía',
  publicationYear: 2007,
};

describe('LibroFormStore', () => {
  let store: LibroFormStore;
  const mockRepo   = { create: vi.fn() };
  const mockRouter = { navigate: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo.create.mockReturnValue(of(CREATED));

    TestBed.configureTestingModule({
      providers: [
        LibroFormStore,
        { provide: BookRepository, useValue: mockRepo },
        { provide: Router,         useValue: mockRouter },
      ],
    });
    store = TestBed.inject(LibroFormStore);
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

  // ── cancel() ───────────────────────────────────────────────────────────────

  describe('cancel()', () => {
    it('navigates to /catalogo', () => {
      store.cancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/catalogo']);
    });
  });

  // ── submit() — happy path ──────────────────────────────────────────────────

  describe('submit() — success', () => {
    it('calls repo.create with the payload', () => {
      store.submit(PAYLOAD);
      expect(mockRepo.create).toHaveBeenCalledWith(PAYLOAD);
    });

    it('navigates to /catalogo on success', () => {
      store.submit(PAYLOAD);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/catalogo']);
    });

    it('resets isSubmitting to false before navigating', () => {
      store.submit(PAYLOAD);
      expect(store.isSubmitting()).toBe(false);
    });

    it('clears fieldErrors before submitting', () => {
      const err422 = new HttpErrorResponse({
        status: 422, error: { errors: { title: 'obligatorio' } },
      });
      mockRepo.create.mockReturnValueOnce(throwError(() => err422));
      store.submit(PAYLOAD);

      mockRepo.create.mockReturnValue(of(CREATED));
      store.submit(PAYLOAD);

      expect(store.fieldErrors()).toEqual({});
    });

    it('clears submitError before submitting', () => {
      const err500 = new HttpErrorResponse({ status: 500 });
      mockRepo.create.mockReturnValueOnce(throwError(() => err500));
      store.submit(PAYLOAD);

      mockRepo.create.mockReturnValue(of(CREATED));
      store.submit(PAYLOAD);

      expect(store.submitError()).toBeNull();
    });
  });

  // ── submit() — error 422 ───────────────────────────────────────────────────

  describe('submit() — 422 validation error', () => {
    it('sets fieldErrors from the response body', () => {
      const err = new HttpErrorResponse({
        status: 422,
        error: { errors: { title: 'El título es obligatorio', author: 'El autor es obligatorio' } },
      });
      mockRepo.create.mockReturnValue(throwError(() => err));

      store.submit(PAYLOAD);

      expect(store.fieldErrors()).toEqual({
        title:  'El título es obligatorio',
        author: 'El autor es obligatorio',
      });
    });

    it('sets isSubmitting to false after 422', () => {
      const err = new HttpErrorResponse({
        status: 422, error: { errors: { title: 'obligatorio' } },
      });
      mockRepo.create.mockReturnValue(throwError(() => err));

      store.submit(PAYLOAD);

      expect(store.isSubmitting()).toBe(false);
    });

    it('does not set submitError on 422', () => {
      const err = new HttpErrorResponse({
        status: 422, error: { errors: { title: 'obligatorio' } },
      });
      mockRepo.create.mockReturnValue(throwError(() => err));

      store.submit(PAYLOAD);

      expect(store.submitError()).toBeNull();
    });
  });

  // ── submit() — error genérico ──────────────────────────────────────────────

  describe('submit() — generic server error', () => {
    it('sets submitError on non-422 HTTP error', () => {
      const err = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
      mockRepo.create.mockReturnValue(throwError(() => err));

      store.submit(PAYLOAD);

      expect(store.submitError()).not.toBeNull();
    });

    it('sets isSubmitting to false after server error', () => {
      const err = new HttpErrorResponse({ status: 503 });
      mockRepo.create.mockReturnValue(throwError(() => err));

      store.submit(PAYLOAD);

      expect(store.isSubmitting()).toBe(false);
    });

    it('does not populate fieldErrors on generic error', () => {
      const err = new HttpErrorResponse({ status: 500 });
      mockRepo.create.mockReturnValue(throwError(() => err));

      store.submit(PAYLOAD);

      expect(store.fieldErrors()).toEqual({});
    });
  });
});
