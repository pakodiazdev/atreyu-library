import { Component, Input, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiBtnDirective } from '../../../shared/ui';
import { BookFormStore } from './book-form.store';

@Component({
  standalone: true,
  selector: 'app-book-form',
  imports: [ReactiveFormsModule, UiBtnDirective],
  providers: [BookFormStore],
  templateUrl: './book-form.component.html',
})
export class BookFormComponent {
  protected readonly store = inject(BookFormStore);
  private  readonly fb    = inject(FormBuilder);

  readonly form = this.fb.group({
    title:           ['', [Validators.required, Validators.maxLength(255)]],
    author:          ['', [Validators.required, Validators.maxLength(255)]],
    genre:           ['', [Validators.maxLength(100)]],
    publicationYear: [null as number | null, [Validators.min(1), Validators.max(2100)]],
    synopsis:        [''],
  });

  @Input() set bookCode(value: string | null | undefined) {
    const code = value || null;
    this.store.setBookCode(code);
    if (code === null) this.form.reset();
  }

  constructor() {
    effect(() => {
      const book = this.store.editedBook();
      if (book) {
        this.form.patchValue({
          title:           book.title,
          author:          book.author,
          genre:           book.genre ?? '',
          publicationYear: book.publicationYear,
          synopsis:        book.synopsis ?? '',
        });
      } else if (!this.store.isEditMode()) {
        this.form.reset();
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.store.submit({
      title:           v.title!,
      author:          v.author!,
      genre:           v.genre || null,
      publicationYear: v.publicationYear ? Number(v.publicationYear) : null,
      synopsis:        v.synopsis || null,
    });
  }

  protected fieldError(field: string): string | null {
    const serverErr = this.store.fieldErrors()[field];
    if (serverErr) return serverErr;
    const ctrl = this.form.get(field);
    if (!ctrl?.invalid || !ctrl.touched) return null;
    if (ctrl.errors?.['required'])   return 'Este campo es obligatorio';
    if (ctrl.errors?.['maxlength'])  return `Máximo ${ctrl.errors['maxlength'].requiredLength} caracteres`;
    if (ctrl.errors?.['min'])        return 'El año debe ser mayor a 0';
    if (ctrl.errors?.['max'])        return 'El año no puede superar 2100';
    return null;
  }

  protected inputClass(field: string): string {
    const base = 'block w-full font-ui text-[15px] text-tinta bg-papel-claro'
      + ' placeholder:text-tinta-muted focus:outline-none transition-colors'
      + ' border-[1.5px] rounded-lg px-3 py-2';
    return this.fieldError(field)
      ? `${base} border-oxido focus:border-oxido`
      : `${base} border-tinta-suave/70 focus:border-tinta`;
  }
}
