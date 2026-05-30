import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { Location } from '@angular/common';
import { vi } from 'vitest';
import { GenerosComponent } from './generos.component';
import { GenerosRepository } from './generos.repository';
import { DrawerService } from '../../shared/ui/drawer.service';
import { GenreStats } from './generos.model';
import { Book } from '../books/book.model';

const GENRES: GenreStats[] = [
  { genre: 'Fantasía', count: 5 },
  { genre: 'Novela',   count: 3 },
];

const BOOKS: Book[] = [
  { code: 'A01', ulid: '01', title: 'El Nombre del Viento', author: 'Rothfuss', genre: 'Fantasía', publicationYear: 2007 },
];

const pageOf = (...books: Book[]) => ({ content: books, page: 0, size: 10, totalElements: books.length, totalPages: 1, hasNext: false, hasPrevious: false });

function makeDrawer() {
  return {
    openDetailFrom:       vi.fn(),
    clearDeletedBookCode: vi.fn(),
    deletedBookCode:      signal<string | null>(null),
    createdBook:          signal<{ code: string; genre: string | null } | null>(null),
  };
}

function makeRoute(paramGenre: string | null = null, queryGenres: string[] = []) {
  return {
    snapshot: {
      paramMap:  { get: () => paramGenre },
      queryParamMap: { getAll: () => queryGenres },
    },
  };
}

function setup(paramGenre: string | null = null, queryGenres: string[] = []) {
  const mockRepo     = { getGenres: vi.fn(() => of(GENRES)), getBooksByGenre: vi.fn(() => of(pageOf(...BOOKS))) };
  const mockDrawer   = makeDrawer();
  const mockLocation = { path: vi.fn(() => '/generos') };
  const mockRouter   = { navigate: vi.fn(), navigateByUrl: vi.fn(), url: '/generos' };

  TestBed.configureTestingModule({
    imports: [GenerosComponent],
    providers: [
      { provide: GenerosRepository, useValue: mockRepo },
      { provide: DrawerService,     useValue: mockDrawer },
      { provide: ActivatedRoute,    useValue: makeRoute(paramGenre, queryGenres) },
      { provide: Location,          useValue: mockLocation },
      { provide: Router,            useValue: mockRouter },
    ],
  });

  const fixture = TestBed.createComponent(GenerosComponent);
  fixture.detectChanges();
  TestBed.flushEffects();
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance, mockRepo, mockDrawer };
}

describe('GenerosComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    expect(setup().component).toBeTruthy();
  });

  it('starts with empty activeGenres when no route params', () => {
    const { component } = setup();
    expect(component.activeGenres()).toEqual([]);
  });

  it('sets activeGenres from route paramMap genre', () => {
    const { component } = setup('Fantasía');
    expect(component.activeGenres()).toEqual(['Fantasía']);
  });

  it('sets activeGenres from query params generos[]', () => {
    const { component } = setup(null, ['Fantasía', 'Novela']);
    expect(component.activeGenres()).toEqual(['Fantasía', 'Novela']);
  });

  it('toggleGenre adds genre when not active', () => {
    const { component } = setup();
    component.toggleGenre('Fantasía');
    expect(component.activeGenres()).toContain('Fantasía');
  });

  it('toggleGenre removes genre when already active', () => {
    const { component } = setup('Fantasía');
    component.toggleGenre('Fantasía');
    expect(component.activeGenres()).not.toContain('Fantasía');
  });

  it('openDetail calls drawer.openDetailFrom with book code and current path', () => {
    const { component, mockDrawer } = setup();
    const book = BOOKS[0];
    component.openDetail(book);
    expect(mockDrawer.openDetailFrom).toHaveBeenCalledWith(book.code, '/generos');
  });
});
