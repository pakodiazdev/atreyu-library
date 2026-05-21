import { TestBed } from '@angular/core/testing';
import { BookCardComponent } from './book-card.component';
import { Book } from '../../../books/book.model';

const BOOK_WITH_GENRE: Book  = { ulid: '1', code: 'A01', title: 'El Quijote', author: 'Cervantes', publicationYear: 1605, genre: 'Novela' };
const BOOK_NO_GENRE: Book    = { ulid: '2', code: 'B02', title: 'La Odisea', author: 'Homero', publicationYear: -800, genre: null };

function setup(book: Book) {
  TestBed.configureTestingModule({ imports: [BookCardComponent] });
  const fixture = TestBed.createComponent(BookCardComponent);
  fixture.componentRef.setInput('book', book);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement, component: fixture.componentInstance };
}

describe('BookCardComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const { component } = setup(BOOK_WITH_GENRE);
    expect(component).toBeTruthy();
  });

  it('renders the book code', () => {
    const { el } = setup(BOOK_WITH_GENRE);
    expect(el.textContent).toContain('A01');
  });

  it('renders the book title', () => {
    const { el } = setup(BOOK_WITH_GENRE);
    expect(el.textContent).toContain('El Quijote');
  });

  it('renders the author', () => {
    const { el } = setup(BOOK_WITH_GENRE);
    expect(el.textContent).toContain('Cervantes');
  });

  it('renders genre badge when genre is set', () => {
    const { el } = setup(BOOK_WITH_GENRE);
    expect(el.textContent).toContain('Novela');
  });

  it('does not render genre badge when genre is null', () => {
    const { el } = setup(BOOK_NO_GENRE);
    expect(el.querySelector('ui-badge')).toBeNull();
  });

  describe('selected output', () => {
    it('emits the book when the button is clicked', () => {
      const { fixture, component, el } = setup(BOOK_WITH_GENRE);
      const emitted: Book[] = [];
      component.selected.subscribe((b: Book) => emitted.push(b));

      el.querySelector<HTMLButtonElement>('button')!.click();
      fixture.detectChanges();

      expect(emitted).toHaveLength(1);
      expect(emitted[0].code).toBe('A01');
    });
  });
});
