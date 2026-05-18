import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { BookDeleteFormComponent } from './book-delete-form.component';
import { BookDeleteFormStore } from './book-delete-form.store';

type FormInternals = {
  submit(): void;
  inputClass(): string;
  confirmCode: ReturnType<typeof signal<string>>;
};
function expose(c: BookDeleteFormComponent): FormInternals {
  return c as unknown as FormInternals;
}

function makeStore(bookCode = 'ABK2') {
  return {
    bookCode:     signal<string | null>(bookCode),
    bookUlid:     signal<string | null>('01JTEST00000000000000001'),
    isSubmitting: signal(false),
    submitError:  signal<string | null>(null),
    codeError:    signal<string | null>(null),
    submit:       vi.fn(),
    cancel:       vi.fn(),
  } as unknown as BookDeleteFormStore;
}

describe('BookDeleteFormComponent', () => {
  let store: BookDeleteFormStore;

  function configure() {
    store = makeStore();

    TestBed.configureTestingModule({
      imports: [BookDeleteFormComponent],
      providers: [{ provide: BookDeleteFormStore, useValue: store }],
    }).overrideComponent(BookDeleteFormComponent, { set: { providers: [] } });

    const fixture = TestBed.createComponent(BookDeleteFormComponent);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  // ── inputClass() ───────────────────────────────────────────────────────────

  describe('inputClass()', () => {
    it('returns normal border class when there is no code error', () => {
      const fixture = configure();
      expect(expose(fixture.componentInstance).inputClass()).toContain('border-tinta-suave/70');
    });

    it('returns error border class when codeError is set', () => {
      const fixture = configure();
      (store.codeError as ReturnType<typeof signal<string | null>>).set('error');
      expect(expose(fixture.componentInstance).inputClass()).toContain('border-oxido');
    });
  });

  // ── submit() ───────────────────────────────────────────────────────────────

  describe('submit()', () => {
    it('calls store.submit with the current confirmCode value', () => {
      const fixture = configure();
      const comp = fixture.componentInstance;
      expose(comp).confirmCode.set('ABK2');
      expose(comp).submit();
      expect(store.submit).toHaveBeenCalledWith('ABK2');
    });

    it('calls store.submit with empty string when no code entered', () => {
      const fixture = configure();
      expose(fixture.componentInstance).submit();
      expect(store.submit).toHaveBeenCalledWith('');
    });
  });

  // ── template ───────────────────────────────────────────────────────────────

  describe('template', () => {
    it('renders the expected book code', () => {
      const fixture = configure();
      const codeEl = fixture.debugElement.query(By.css('[data-cy="expected-code"]'));
      expect(codeEl.nativeElement.textContent.trim()).toBe('ABK2');
    });

    it('calls store.cancel when cancel button is clicked', () => {
      const fixture = configure();
      fixture.debugElement.query(By.css('[data-cy="btn-cancel"]'))
        .triggerEventHandler('click', null);
      expect(store.cancel).toHaveBeenCalled();
    });

    it('renders confirm-delete button', () => {
      const fixture = configure();
      const btn = fixture.debugElement.query(By.css('[data-cy="btn-confirm-delete"]'));
      expect(btn).not.toBeNull();
    });

    it('does not show code error when codeError is null', () => {
      const fixture = configure();
      const errEl = fixture.debugElement.query(By.css('[data-cy="error-confirm-code"]'));
      expect(errEl).toBeNull();
    });

    it('does not show submit error when submitError is null', () => {
      const fixture = configure();
      const errEl = fixture.debugElement.query(By.css('[data-cy="submit-error"]'));
      expect(errEl).toBeNull();
    });
  });
});
