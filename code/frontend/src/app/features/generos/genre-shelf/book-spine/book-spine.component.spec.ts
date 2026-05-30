import { TestBed } from '@angular/core/testing';
import { BookSpineComponent } from './book-spine.component';
import { Book } from '../../../books/book.model';

const BOOK: Book = {
  code: 'A01', ulid: '01', title: 'El Nombre del Viento',
  author: 'Rothfuss', genre: 'Fantasía', publicationYear: 2007,
};

function setup(overrides: Partial<{ removing: boolean; appearing: boolean }> = {}) {
  TestBed.configureTestingModule({ imports: [BookSpineComponent] });
  const fixture = TestBed.createComponent(BookSpineComponent);
  fixture.componentRef.setInput('book',      BOOK);
  fixture.componentRef.setInput('colorIndex', 0);
  if (overrides.removing  !== undefined) fixture.componentRef.setInput('removing',  overrides.removing);
  if (overrides.appearing !== undefined) fixture.componentRef.setInput('appearing', overrides.appearing);
  fixture.detectChanges();
  return { el: fixture.nativeElement as HTMLElement, component: fixture.componentInstance, fixture };
}

describe('BookSpineComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    expect(setup().component).toBeTruthy();
  });

  it('renders the book title', () => {
    const { el } = setup();
    expect(el.textContent).toContain('El Nombre del Viento');
  });

  it('shows title and author in the button tooltip', () => {
    const { el } = setup();
    const btn = el.querySelector('button')!;
    expect(btn.title).toContain('El Nombre del Viento');
    expect(btn.title).toContain('Rothfuss');
  });

  it('emits spineClick with the book on click', () => {
    const { el, component } = setup();
    const emitted: Book[] = [];
    component.spineClick.subscribe((b: Book) => emitted.push(b));
    (el.querySelector('button') as HTMLButtonElement).click();
    expect(emitted[0]).toEqual(BOOK);
  });

  it('sets max-width to 0 when removing is true', () => {
    const { el } = setup({ removing: true });
    const wrapper = el.querySelector<HTMLElement>('div')!;
    expect(parseInt(wrapper.style.maxWidth)).toBe(0);
  });

  it('sets max-width to 2.5rem when not removing', () => {
    const { el } = setup({ removing: false });
    const wrapper = el.querySelector<HTMLElement>('div')!;
    expect(wrapper.style.maxWidth).toBe('2.5rem');
  });

  it('clears max-width style when appearing is true (animation takes over)', () => {
    const { el } = setup({ appearing: true });
    const wrapper = el.querySelector<HTMLElement>('div')!;
    expect(wrapper.style.maxWidth).toBe('');
  });

  it('applies entrance animation when appearing is true', () => {
    const { el } = setup({ appearing: true });
    const wrapper = el.querySelector<HTMLElement>('div')!;
    expect(wrapper.style.animation).toContain('genreSpineSlideIn');
  });
});
