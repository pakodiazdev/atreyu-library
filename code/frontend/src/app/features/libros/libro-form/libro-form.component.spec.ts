import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { vi } from 'vitest';
import { LibroFormComponent } from './libro-form.component';
import { LibroFormStore } from './libro-form.store';
import { BookCreatePayload } from '../book.model';

function makeStore() {
  return {
    isSubmitting: signal(false),
    fieldErrors:  signal<Record<string, string>>({}),
    submitError:  signal<string | null>(null),
    submit: vi.fn(),
    cancel: vi.fn(),
  } as unknown as LibroFormStore;
}

function makeRoute(params: Record<string, string> = {}) {
  return { snapshot: { paramMap: convertToParamMap(params) } };
}

describe('LibroFormComponent', () => {
  let component: LibroFormComponent;
  let store: ReturnType<typeof makeStore>;

  function configure(routeParams: Record<string, string> = {}) {
    store = makeStore();

    TestBed.configureTestingModule({
      imports: [LibroFormComponent],
      providers: [
        { provide: LibroFormStore,  useValue: store },
        { provide: ActivatedRoute,  useValue: makeRoute(routeParams) },
      ],
    }).overrideComponent(LibroFormComponent, { set: { providers: [] } });

    const fixture = TestBed.createComponent(LibroFormComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  // ── isEditMode ─────────────────────────────────────────────────────────────

  describe('isEditMode', () => {
    it('is false on create route (no bookSlug param)', () => {
      configure();
      expect(component.isEditMode).toBe(false);
    });

    it('is true on edit route (bookSlug param present)', () => {
      configure({ bookSlug: 'A01-cien-anos-de-soledad' });
      expect(component.isEditMode).toBe(true);
    });
  });

  // ── fieldError() ───────────────────────────────────────────────────────────

  describe('fieldError()', () => {
    beforeEach(() => configure());

    it('returns null for pristine valid field', () => {
      expect(component.fieldError('title')).toBeNull();
    });

    it('returns null for touched field without errors', () => {
      component.form.get('genre')!.markAsTouched();
      expect(component.fieldError('genre')).toBeNull();
    });

    it('returns "obligatorio" message for required field when touched', () => {
      component.form.get('title')!.markAsTouched();
      expect(component.fieldError('title')).toBe('Este campo es obligatorio');
    });

    it('returns "obligatorio" message for author when touched', () => {
      component.form.get('author')!.markAsTouched();
      expect(component.fieldError('author')).toBe('Este campo es obligatorio');
    });

    it('returns maxlength message when title exceeds 255 chars', () => {
      const ctrl = component.form.get('title')!;
      ctrl.setValue('a'.repeat(256));
      ctrl.markAsTouched();
      const err = component.fieldError('title');
      expect(err).toContain('255');
    });

    it('returns maxlength message when genre exceeds 100 chars', () => {
      const ctrl = component.form.get('genre')!;
      ctrl.setValue('x'.repeat(101));
      ctrl.markAsTouched();
      const err = component.fieldError('genre');
      expect(err).toContain('100');
    });

    it('returns min error when publicationYear is 0', () => {
      const ctrl = component.form.get('publicationYear')!;
      ctrl.setValue(0);
      ctrl.markAsTouched();
      expect(component.fieldError('publicationYear')).toBe('El año debe ser mayor a 0');
    });

    it('returns max error when publicationYear exceeds 2100', () => {
      const ctrl = component.form.get('publicationYear')!;
      ctrl.setValue(2101);
      ctrl.markAsTouched();
      expect(component.fieldError('publicationYear')).toBe('El año no puede superar 2100');
    });

    it('returns server error when fieldErrors signal contains the field', () => {
      (store.fieldErrors as WritableSignal<Record<string, string>>)
        .set({ title: 'Error del servidor' });
      expect(component.fieldError('title')).toBe('Error del servidor');
    });

    it('server error takes precedence over client validation error', () => {
      component.form.get('title')!.markAsTouched();
      (store.fieldErrors as WritableSignal<Record<string, string>>)
        .set({ title: 'Del servidor' });
      expect(component.fieldError('title')).toBe('Del servidor');
    });
  });

  // ── inputClass() ───────────────────────────────────────────────────────────

  describe('inputClass()', () => {
    beforeEach(() => configure());

    it('returns normal border class when field has no error', () => {
      expect(component.inputClass('title')).toContain('border-tinta-suave/70');
    });

    it('returns error border class when field has validation error', () => {
      component.form.get('title')!.markAsTouched();
      expect(component.inputClass('title')).toContain('border-oxido');
    });

    it('returns error border class when field has server error', () => {
      (store.fieldErrors as WritableSignal<Record<string, string>>)
        .set({ author: 'Requerido' });
      expect(component.inputClass('author')).toContain('border-oxido');
    });

    it('returned class always contains base styles', () => {
      const cls = component.inputClass('title');
      expect(cls).toContain('block w-full');
      expect(cls).toContain('font-ui');
    });
  });

  // ── submit() ───────────────────────────────────────────────────────────────

  describe('submit()', () => {
    it('marks all controls as touched when form is invalid', () => {
      configure();
      (component as unknown as { submit(): void }).submit();

      expect(component.form.get('title')!.touched).toBe(true);
      expect(component.form.get('author')!.touched).toBe(true);
    });

    it('does not call store.submit when form is invalid', () => {
      configure();
      (component as unknown as { submit(): void }).submit();
      expect(store.submit).not.toHaveBeenCalled();
    });

    it('does not call store.submit in edit mode even with valid form', () => {
      configure({ bookSlug: 'A01-cien-anos' });
      component.form.setValue({
        title: 'Título', author: 'Autor', genre: '', publicationYear: null, synopsis: '',
      });
      (component as unknown as { submit(): void }).submit();
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

      (component as unknown as { submit(): void }).submit();

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

      (component as unknown as { submit(): void }).submit();

      expect(store.submit).toHaveBeenCalledWith<[BookCreatePayload]>({
        title:           'Sólo título',
        author:          'Sólo autor',
        genre:           null,
        publicationYear: null,
        synopsis:        null,
      });
    });
  });
});
