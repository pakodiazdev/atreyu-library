import { TestBed } from '@angular/core/testing';
import { EMPTY, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LibroDetailStore } from './libro-detail.store';
import { BookRepository } from '../book.repository';
import { BookDetail } from '../book.model';

const MOCK_DETAIL: BookDetail = {
  code: 'A01',
  ulid: '01JTEST00000000000000001',
  title: 'El Nombre del Viento',
  author: 'Patrick Rothfuss',
  genre: 'Fantasía',
  publicationYear: 2007,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

describe('LibroDetailStore', () => {
  let store: LibroDetailStore;
  const mockRepo   = { getById: vi.fn().mockReturnValue(EMPTY) };
  const mockRouter = { navigate: vi.fn() };

  function setup(getById = vi.fn().mockReturnValue(EMPTY)) {
    mockRepo.getById = getById;
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        LibroDetailStore,
        { provide: BookRepository, useValue: mockRepo },
        { provide: Router,         useValue: mockRouter },
      ],
    });
    store = TestBed.inject(LibroDetailStore);
  }

  beforeEach(() => setup());

  it('initializes ulid as empty string', () => {
    expect(store.ulid()).toBe('');
  });

  it('book() is null initially', () => {
    expect(store.book()).toBeNull();
  });

  it('notFound is false initially', () => {
    expect(store.notFound()).toBe(false);
  });

  it('setUlid updates the ulid signal', () => {
    TestBed.runInInjectionContext(() => store.setUlid('01JTEST00000000000000001'));
    expect(store.ulid()).toBe('01JTEST00000000000000001');
  });

  it('book() returns data after resource resolves', async () => {
    vi.useFakeTimers();
    setup(vi.fn().mockReturnValue(of(MOCK_DETAIL)));

    TestBed.runInInjectionContext(() => store.setUlid('01JTEST00000000000000001'));

    vi.runAllTimers();
    await Promise.resolve();
    TestBed.flushEffects();
    vi.useRealTimers();

    expect(store.book()).toEqual(MOCK_DETAIL);
  });

  it('notFound is true on 404 HTTP error', async () => {
    vi.useFakeTimers();
    const err = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    setup(vi.fn().mockReturnValue(throwError(() => err)));

    TestBed.runInInjectionContext(() => store.setUlid('MISSING'));

    vi.runAllTimers();
    await Promise.resolve();
    TestBed.flushEffects();
    vi.useRealTimers();

    expect(store.notFound()).toBe(true);
  });

  it('goBack navigates to /catalogo', () => {
    store.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/catalogo']);
  });
});
