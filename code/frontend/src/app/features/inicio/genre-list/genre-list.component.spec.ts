import { TestBed } from '@angular/core/testing';
import { GenreListComponent } from './genre-list.component';
import { GenreStats } from '../inicio.model';

const GENRES: GenreStats[] = [
  { genre: 'Novela', count: 5 },
  { genre: 'Fantasía', count: 3 },
];

function setup(genres: GenreStats[] = [], loading = false) {
  TestBed.configureTestingModule({ imports: [GenreListComponent] });
  const fixture = TestBed.createComponent(GenreListComponent);
  fixture.componentRef.setInput('genres', genres);
  fixture.componentRef.setInput('loading', loading);
  fixture.detectChanges();
  return { el: fixture.nativeElement as HTMLElement, component: fixture.componentInstance };
}

describe('GenreListComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('renders skeleton chips when loading', () => {
    const { el } = setup([], true);
    expect(el.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows empty message when no genres and not loading', () => {
    const { el } = setup([]);
    expect(el.textContent).toContain('No hay géneros registrados todavía.');
  });

  it('renders one chip per genre', () => {
    const { el } = setup(GENRES);
    const chips = el.querySelectorAll('button.rounded-full');
    expect(chips.length).toBe(GENRES.length);
  });

  it('renders genre name', () => {
    const { el } = setup(GENRES);
    expect(el.textContent).toContain('Novela');
    expect(el.textContent).toContain('Fantasía');
  });

  it('renders genre count', () => {
    const { el } = setup(GENRES);
    expect(el.textContent).toContain('5');
    expect(el.textContent).toContain('3');
  });

  it('skeletons array has 6 elements', () => {
    const { component } = setup();
    expect((component as unknown as { skeletons: unknown[] }).skeletons.length).toBe(6);
  });
});
