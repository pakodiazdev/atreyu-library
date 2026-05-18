import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiBtnDirective } from '../../../shared/ui';
import { BookDeleteFormStore } from './book-delete-form.store';

@Component({
  standalone: true,
  selector: 'app-book-delete-form',
  imports: [UiBtnDirective, FormsModule],
  providers: [BookDeleteFormStore],
  templateUrl: './book-delete-form.component.html',
})
export class BookDeleteFormComponent {
  protected readonly store = inject(BookDeleteFormStore);

  protected readonly confirmCode = signal('');

  protected submit(): void {
    this.store.submit(this.confirmCode());
  }

  protected inputClass(): string {
    const base = 'block w-full font-ui text-[15px] text-tinta bg-papel-claro'
      + ' placeholder:text-tinta-muted focus:outline-none transition-colors'
      + ' border-[1.5px] rounded-lg px-3 py-2';
    return this.store.codeError()
      ? `${base} border-oxido focus:border-oxido`
      : `${base} border-tinta-suave/70 focus:border-tinta`;
  }
}
