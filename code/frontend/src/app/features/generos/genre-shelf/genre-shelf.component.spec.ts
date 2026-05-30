import { TestBed } from '@angular/core/testing';
import { GenreShelfComponent } from './genre-shelf.component';
import { Book } from '../../books/book.model';

const BOOKS: Book[] = [
  { code: 'A01', ulid: '01', title: 'El Nombre del Viento', author: 'Rothfuss', genre: 'Fantasía', publicationYear: 2007 },
  { code: 'A02', ulid: '02', title: 'Dune',                 author: 'Herbert',  genre: 'Sci-Fi',   publicationYear: 1965 },
];

function setup(books: Book[] = [], removingCode: string | null = null, appearingCode: string | null = null) {
  TestBed.configureTestingModule({ imports: [GenreShelfComponent] });
  const fixture = TestBed.createComponent(GenreShelfComponent);
  fixture.componentRef.setInput('genre',        'Fantasía');
  fixture.componentRef.setInput('books',        books);
  fixture.componentRef.setInput('colorOffset',  0);
  fixture.componentRef.setInput('removingCode', removingCode);
  fixture.componentRef.setInput('appearingCode', appearingCode);
  fixture.detectChanges();
  return { el: fixture.nativeElement as HTMLElement, component: fixture.componentInstance, fixture };
}

describe('GenreShelfComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    expect(setup().component).toBeTruthy();
  });

  it('renders the genre name', () => {
    const { el } = setup(BOOKS);
    expect(el.querySelector('h2')!.textContent).toContain('Fantasía');
  });

  it('renders the book count', () => {
    const { el } = setup(BOOKS);
    expect(el.textContent).toContain(`${BOOKS.length} libros`);
  });

  it('renders one spine per book', () => {
    const { el } = setup(BOOKS);
    expect(el.querySelectorAll('app-book-spine').length).toBe(BOOKS.length);
  });

  it('shows empty message when no books', () => {
    const { el } = setup([]);
    expect(el.textContent).toContain('Sin libros en este género');
  });

  it('emits bookClick when a spine is clicked', () => {
    const { el, component } = setup(BOOKS);
    const emitted: Book[] = [];
    component.bookClick.subscribe((b: Book) => emitted.push(b));
    (el.querySelector('button') as HTMLButtonElement).click();
    expect(emitted[0]).toEqual(BOOKS[0]);
  });
});
