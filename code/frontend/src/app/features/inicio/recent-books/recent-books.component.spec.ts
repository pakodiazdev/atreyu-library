import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { RecentBooksComponent } from './recent-books.component';
import { Book } from '../../books/book.model';

const BOOKS: Book[] = [
  { ulid: '1', code: 'A01', title: 'El Quijote', author: 'Cervantes', publicationYear: 1605, genre: 'Novela' },
  { ulid: '2', code: 'B02', title: 'La Odisea', author: 'Homero', publicationYear: -800, genre: null },
];

function setup(books: Book[] = [], loading = false) {
  TestBed.configureTestingModule({ imports: [RecentBooksComponent] });
  const fixture = TestBed.createComponent(RecentBooksComponent);
  fixture.componentRef.setInput('books', books);
  fixture.componentRef.setInput('loading', loading);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement, component: fixture.componentInstance };
}

describe('RecentBooksComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  describe('loading state', () => {
    it('renders skeleton placeholders when loading', () => {
      const { el } = setup([], true);
      const skeletons = el.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('empty state', () => {
    it('shows empty message when no books', () => {
      const { el } = setup([]);
      expect(el.textContent).toContain('No hay libros en el catálogo todavía.');
    });
  });

  describe('books list', () => {
    it('renders one book-card per book', () => {
      const { el } = setup(BOOKS);
      const cards = el.querySelectorAll('app-book-card');
      expect(cards.length).toBe(2);
    });

    it('emits bookSelected when a book card button is clicked', () => {
      const { fixture, component, el } = setup(BOOKS);
      const emitted: Book[] = [];
      component.bookSelected.subscribe((b: Book) => emitted.push(b));

      el.querySelector<HTMLButtonElement>('app-book-card button')!.click();
      fixture.detectChanges();

      expect(emitted).toHaveLength(1);
      expect(emitted[0].code).toBe('A01');
    });
  });

  describe('onWheel()', () => {
    it('calls preventDefault and adjusts scrollLeft', () => {
      const { fixture, component } = setup(BOOKS);
      fixture.detectChanges();

      const fakeEl = { scrollLeft: 0 };
      (component as unknown as { carouselRef: { nativeElement: typeof fakeEl } }).carouselRef = { nativeElement: fakeEl };

      const event = { deltaY: 100, preventDefault: vi.fn() } as unknown as WheelEvent;
      (component as unknown as { onWheel(e: WheelEvent): void }).onWheel(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(fakeEl.scrollLeft).toBe(100);
    });

    it('is a no-op when carouselRef is undefined', () => {
      const { component } = setup([]);
      (component as unknown as { carouselRef: undefined }).carouselRef = undefined;
      expect(() => {
        (component as unknown as { onWheel(e: WheelEvent): void }).onWheel({ deltaY: 50, preventDefault: vi.fn() } as unknown as WheelEvent);
      }).not.toThrow();
    });
  });

  describe('scrollBy()', () => {
    it('calls el.scrollBy with positive offset for direction 1', () => {
      const { component } = setup(BOOKS);
      const scrollBy = vi.fn();
      (component as unknown as { carouselRef: { nativeElement: { scrollBy: typeof scrollBy } } }).carouselRef = { nativeElement: { scrollBy } };

      (component as unknown as { scrollBy(d: 1 | -1): void }).scrollBy(1);

      expect(scrollBy).toHaveBeenCalledWith({ left: 180, behavior: 'smooth' });
    });

    it('calls el.scrollBy with negative offset for direction -1', () => {
      const { component } = setup(BOOKS);
      const scrollBy = vi.fn();
      (component as unknown as { carouselRef: { nativeElement: { scrollBy: typeof scrollBy } } }).carouselRef = { nativeElement: { scrollBy } };

      (component as unknown as { scrollBy(d: 1 | -1): void }).scrollBy(-1);

      expect(scrollBy).toHaveBeenCalledWith({ left: -180, behavior: 'smooth' });
    });

    it('is a no-op when carouselRef is undefined', () => {
      const { component } = setup([]);
      (component as unknown as { carouselRef: undefined }).carouselRef = undefined;
      expect(() => {
        (component as unknown as { scrollBy(d: 1 | -1): void }).scrollBy(1);
      }).not.toThrow();
    });
  });
});
