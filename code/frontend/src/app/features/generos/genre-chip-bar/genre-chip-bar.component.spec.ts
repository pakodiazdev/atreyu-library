import { TestBed } from '@angular/core/testing';
import { GenreChipBarComponent } from './genre-chip-bar.component';
import { GenreStats } from '../generos.model';

const GENRES: GenreStats[] = [
  { genre: 'Fantasía', count: 5 },
  { genre: 'Novela',   count: 3 },
];

function setup(genres: GenreStats[] = [], selected: string[] = [], loading = false) {
  TestBed.configureTestingModule({ imports: [GenreChipBarComponent] });
  const fixture = TestBed.createComponent(GenreChipBarComponent);
  fixture.componentRef.setInput('genres',   genres);
  fixture.componentRef.setInput('selected', selected);
  fixture.componentRef.setInput('loading',  loading);
  fixture.detectChanges();
  return { el: fixture.nativeElement as HTMLElement, fixture, component: fixture.componentInstance };
}

describe('GenreChipBarComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    expect(setup().component).toBeTruthy();
  });

  it('shows skeleton chips while loading', () => {
    const { el } = setup([], [], true);
    expect(el.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('does not render genre chips while loading', () => {
    const { el } = setup(GENRES, [], true);
    expect(el.querySelectorAll('button').length).toBe(0);
  });

  it('renders one button per genre when not loading', () => {
    const { el } = setup(GENRES);
    expect(el.querySelectorAll('button').length).toBe(GENRES.length);
  });

  it('renders genre names in chips', () => {
    const { el } = setup(GENRES);
    expect(el.textContent).toContain('Fantasía');
    expect(el.textContent).toContain('Novela');
  });

  it('renders genre counts in chips', () => {
    const { el } = setup(GENRES);
    expect(el.textContent).toContain('5');
    expect(el.textContent).toContain('3');
  });

  it('emits genreToggle with genre name on chip click', () => {
    const { el, component } = setup(GENRES);
    const emitted: string[] = [];
    component.genreToggle.subscribe((g: string) => emitted.push(g));

    (el.querySelectorAll('button')[0] as HTMLButtonElement).click();
    expect(emitted).toEqual(['Fantasía']);
  });

  it('applies active styles when genre is selected', () => {
    const { el } = setup(GENRES, ['Fantasía']);
    const firstBtn = el.querySelectorAll('button')[0];
    expect(firstBtn.classList.contains('bg-tinta')).toBe(true);
  });

  it('does not apply active styles to unselected genre', () => {
    const { el } = setup(GENRES, ['Fantasía']);
    const secondBtn = el.querySelectorAll('button')[1];
    expect(secondBtn.classList.contains('bg-tinta')).toBe(false);
  });
});
