import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiBtnDirective } from '../../../shared/ui';
import { LibroFormStore } from './libro-form.store';

@Component({
  standalone: true,
  selector: 'app-libro-form',
  imports: [ReactiveFormsModule, UiBtnDirective],
  providers: [LibroFormStore],
  templateUrl: './libro-form.component.html',
})
export class LibroFormComponent {
  protected readonly store = inject(LibroFormStore);
  private  readonly fb    = inject(FormBuilder);

  protected readonly form = this.fb.group({
    title:           ['', [Validators.required, Validators.maxLength(255)]],
    author:          ['', [Validators.required, Validators.maxLength(255)]],
    genre:           ['', [Validators.maxLength(100)]],
    publicationYear: [null as number | null, [Validators.min(1), Validators.max(2100)]],
    synopsis:        [''],
  });

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
