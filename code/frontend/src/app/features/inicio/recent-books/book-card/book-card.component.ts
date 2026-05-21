import { Component, input, output } from '@angular/core';
import { Book } from '../../../books/book.model';
import { UiBadgeComponent } from '../../../../shared/ui';

/**
 * Tarjeta compacta de libro para el carrusel del dashboard.
 *
 * @input  book  - datos del libro a mostrar
 * @output selected - emite el libro cuando el usuario hace clic
 */
@Component({
  standalone: true,
  selector: 'app-book-card',
  imports: [UiBadgeComponent],
  template: `
    <button
      type="button"
      class="flex flex-col w-[160px] shrink-0 text-left border-[1.6px] border-tinta/20 rounded-lg overflow-hidden bg-papel-claro hover:border-tinta/60 hover:shadow-sm transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-oro/50"
      (click)="selected.emit(book())"
      (keydown.enter)="selected.emit(book())"
    >
      <!-- Portada placeholder -->
      <div
        class="w-full aspect-[3/4] relative"
        style="background: repeating-linear-gradient(45deg, rgba(45,33,24,0.06) 0px, rgba(45,33,24,0.06) 1px, transparent 1px, transparent 10px), #e8d5a0;"
      >
        <span class="absolute top-1.5 right-1.5 font-code text-[10px] px-[5px] py-[1px] border border-tinta/60 rounded-[3px] bg-papel-claro text-tinta tracking-[0.05em]">
          {{ book().code }}
        </span>
      </div>
      <!-- Info -->
      <div class="p-2.5 flex flex-col gap-1">
        <p class="font-editorial text-[13px] text-tinta leading-snug line-clamp-2">{{ book().title }}</p>
        <p class="font-ui text-[11px] text-tinta-suave leading-none truncate">{{ book().author }}</p>
        @if (book().genre) {
          <ui-badge variant="default" class="mt-1 text-[10px]">{{ book().genre }}</ui-badge>
        }
      </div>
    </button>
  `,
})
export class BookCardComponent {
  readonly book     = input.required<Book>();
  readonly selected = output<Book>();
}
