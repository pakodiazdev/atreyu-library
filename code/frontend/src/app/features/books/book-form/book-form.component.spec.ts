import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { BookFormComponent } from './book-form.component';
import { BookFormStore } from './book-form.store';
import { BookCreatePayload, BookDetail } from '../book.model';

type FormInternals = {
  fieldError(f: string): string | null;
  inputClass(f: string): string;
  submit(): void;
};
function expose(c: BookFormComponent): FormInternals {
  return c as unknown as FormInternals;
}

function makeStore() {
  return {
    isSubmitting:  signal(false),
    fieldErrors:   signal<Record<string, string>>({}),
    submitError:   signal<string | null>(null),
    isEditMode:    signal(false),
    editedBook:    signal<BookDetail | null>(null),
    isLoadingBook: signal(false),
    isBookNotFound: signal(false),
    submit:        vi.fn(),
    cancel:        vi.fn(),
    setBookCode:   vi.fn(),
  } as unknown as BookFormStore;
}

describe('BookFormComponent', () => {
  let component: BookFormComponent;
  let store: ReturnType<typeof makeStore>;

  function configure(bookCode: string | null = null) {
    store = makeStore();

    TestBed.configureTestingModule({
      imports: [BookFormComponent],
      providers: [
        provideRouter([]),
        { provide: BookFormStore, useValue: store },
      ],
    }).overrideComponent(BookFormComponent, { set: { providers: [] } });

    const fixture = TestBed.createComponent(BookFormComponent);
    if (bookCode) {
      fixture.componentRef.setInput('bookCode', bookCode);
    }
    fixture.detectChanges();
    component = fixture.componentInstance;
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  // ── fieldError() ───────────────────────────────────────────────────────────

  describe('fieldError()', () => {
    beforeEach(() => configure());

    it('returns null for pristine valid field', () => {
      expect(expose(component).fieldError('title')).toBeNull();
    });

    it('returns null for touched field without errors', () => {
      component.form.get('genre')!.markAsTouched();
      expect(expose(component).fieldError('genre')).toBeNull();
    });

    it('returns "obligatorio" message for required field when touched', () => {
      component.form.get('title')!.markAsTouched();
      expect(expose(component).fieldError('title')).toBe('Este campo es obligatorio');
    });

    it('returns "obligatorio" message for author when touched', () => {
      component.form.get('author')!.markAsTouched();
      expect(expose(component).fieldError('author')).toBe('Este campo es obligatorio');
    });

    it('returns maxlength message when title exceeds 255 chars', () => {
      const ctrl = component.form.get('title')!;
      ctrl.setValue('a'.repeat(256));
      ctrl.markAsTouched();
      expect(expose(component).fieldError('title')).toContain('255');
    });

    it('returns maxlength message when genre exceeds 100 chars', () => {
      const ctrl = component.form.get('genre')!;
      ctrl.setValue('x'.repeat(101));
      ctrl.markAsTouched();
      expect(expose(component).fieldError('genre')).toContain('100');
    });

    it('returns min error when publicationYear is 0', () => {
      const ctrl = component.form.get('publicationYear')!;
      ctrl.setValue(0);
      ctrl.markAsTouched();
      expect(expose(component).fieldError('publicationYear')).toBe('El año debe ser mayor a 0');
    });

    it('returns max error when publicationYear exceeds 2100', () => {
      const ctrl = component.form.get('publicationYear')!;
      ctrl.setValue(2101);
      ctrl.markAsTouched();
      expect(expose(component).fieldError('publicationYear')).toBe('El año no puede superar 2100');
    });

    it('returns server error when fieldErrors signal contains the field', () => {
      (store.fieldErrors as WritableSignal<Record<string, string>>)
        .set({ title: 'Error del servidor' });
      expect(expose(component).fieldError('title')).toBe('Error del servidor');
    });

    it('server error takes precedence over client validation error', () => {
      component.form.get('title')!.markAsTouched();
      (store.fieldErrors as WritableSignal<Record<string, string>>)
        .set({ title: 'Del servidor' });
      expect(expose(component).fieldError('title')).toBe('Del servidor');
    });
  });

  // ── inputClass() ───────────────────────────────────────────────────────────

  describe('inputClass()', () => {
    beforeEach(() => configure());

    it('returns normal border class when field has no error', () => {
      expect(expose(component).inputClass('title')).toContain('border-tinta-suave/70');
    });

    it('returns error border class when field has validation error', () => {
      component.form.get('title')!.markAsTouched();
      expect(expose(component).inputClass('title')).toContain('border-oxido');
    });

    it('returns error border class when field has server error', () => {
      (store.fieldErrors as WritableSignal<Record<string, string>>)
        .set({ author: 'Requerido' });
      expect(expose(component).inputClass('author')).toContain('border-oxido');
    });

    it('returned class always contains base styles', () => {
      const cls = expose(component).inputClass('title');
      expect(cls).toContain('block w-full');
      expect(cls).toContain('font-ui');
    });
  });

  // ── submit() ───────────────────────────────────────────────────────────────

  describe('submit()', () => {
    it('marks all controls as touched when form is invalid', () => {
      configure();
      expose(component).submit();

      expect(component.form.get('title')!.touched).toBe(true);
      expect(component.form.get('author')!.touched).toBe(true);
    });

    it('does not call store.submit when form is invalid', () => {
      configure();
      expose(component).submit();
      expect(store.submit).not.toHaveBeenCalled();
    });

    it('calls store.submit with correct payload for fully filled form', () => {
      configure();
      component.form.setValue({
        title:           'El Nombre del Viento',
        author:          'Patrick Rothfuss',
        genre:           'Fantasía',
        publicationYear: 2007,
        synopsis:        'Una sinopsis',
      });

      expose(component).submit();

      expect(store.submit).toHaveBeenCalledWith<[BookCreatePayload]>({
        title:           'El Nombre del Viento',
        author:          'Patrick Rothfuss',
        genre:           'Fantasía',
        publicationYear: 2007,
        synopsis:        'Una sinopsis',
      });
    });

    it('sends null for empty optional fields', () => {
      configure();
      component.form.setValue({
        title:           'Sólo título',
        author:          'Sólo autor',
        genre:           '',
        publicationYear: null,
        synopsis:        '',
      });

      expose(component).submit();

      expect(store.submit).toHaveBeenCalledWith<[BookCreatePayload]>({
        title:           'Sólo título',
        author:          'Sólo autor',
        genre:           null,
        publicationYear: null,
        synopsis:        null,
      });
    });

    it('calls store.submit in edit mode — el store decide create vs update', () => {
      configure('A01');
      expect(store.setBookCode).toHaveBeenCalledWith('A01');

      component.form.setValue({
        title: 'Título', author: 'Autor', genre: '', publicationYear: null, synopsis: '',
      });
      expose(component).submit();

      expect(store.submit).toHaveBeenCalledWith({
        title: 'Título', author: 'Autor', genre: null, publicationYear: null, synopsis: null,
      });
    });
  });

  // ── @Input bookCode ────────────────────────────────────────────────────────

  describe('@Input bookCode', () => {
    it('calls store.setBookCode with the provided value', () => {
      configure('B03');
      expect(store.setBookCode).toHaveBeenCalledWith('B03');
    });

    it('does not call store.setBookCode when no bookCode input is provided', () => {
      configure(null);
      expect(store.setBookCode).not.toHaveBeenCalled();
    });
  });

  // ── effect: patch / reset form ─────────────────────────────────────────────

  describe('effect — form patch and reset', () => {
    it('patches the form when editedBook emits a book', () => {
      const fixture = configure();
      const book: BookDetail = {
        code: 'A01', ulid: '01JTEST', title: 'Dune', author: 'Herbert',
        genre: 'Sci-Fi', publicationYear: 1965,
      };

      (store.editedBook as WritableSignal<BookDetail | null>).set(book);
      fixture.detectChanges();
      TestBed.flushEffects();

      expect(component.form.value.title).toBe('Dune');
      expect(component.form.value.author).toBe('Herbert');
      expect(component.form.value.genre).toBe('Sci-Fi');
      expect(component.form.value.publicationYear).toBe(1965);
    });

    it('resets the form when switching from edit mode to create mode', () => {
      const fixture = configure();
      const book: BookDetail = {
        code: 'A01', ulid: '01JTEST', title: 'Dune', author: 'Herbert',
        genre: 'Sci-Fi', publicationYear: 1965,
      };

      // Simular modo edición con datos cargados
      (store.isEditMode as WritableSignal<boolean>).set(true);
      (store.editedBook as WritableSignal<BookDetail | null>).set(book);
      fixture.detectChanges();
      TestBed.flushEffects();
      expect(component.form.value.title).toBe('Dune');

      // Simular cambio a modo creación
      (store.isEditMode as WritableSignal<boolean>).set(false);
      (store.editedBook as WritableSignal<BookDetail | null>).set(null);
      fixture.detectChanges();
      TestBed.flushEffects();

      expect(component.form.value.title).toBeNull();
      expect(component.form.value.author).toBeNull();
      expect(component.form.value.genre).toBeNull();
      expect(component.form.value.publicationYear).toBeNull();
    });

    it('does not reset the form while still in edit mode (book loading)', () => {
      const fixture = configure('A01');
      const book: BookDetail = {
        code: 'A01', ulid: '01JTEST', title: 'Dune', author: 'Herbert',
        genre: null, publicationYear: null,
      };

      (store.isEditMode as WritableSignal<boolean>).set(true);
      (store.editedBook as WritableSignal<BookDetail | null>).set(book);
      fixture.detectChanges();
      TestBed.flushEffects();

      // Simular libro en carga (editedBook null) pero aún en edit mode
      (store.editedBook as WritableSignal<BookDetail | null>).set(null);
      fixture.detectChanges();
      TestBed.flushEffects();

      // El formulario NO debe resetearse porque isEditMode sigue siendo true
      expect(component.form.value.title).toBe('Dune');
    });
  });
});
