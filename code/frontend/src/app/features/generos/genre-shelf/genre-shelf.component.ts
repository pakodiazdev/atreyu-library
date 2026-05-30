import { Component, input, output } from '@angular/core';
import { Book } from '../../books/book.model';
import { BookSpineComponent } from './book-spine/book-spine.component';

@Component({
  standalone: true,
  selector: 'app-genre-shelf',
  imports: [BookSpineComponent],
  template: `
    <section class="mb-8" data-cy="genre-shelf" [attr.data-genre]="genre()">
      <div class="flex items-baseline gap-3 mb-2">
        <h2 class="font-editorial text-xl text-tinta" data-cy="genre-shelf-title">{{ genre() }}</h2>
        <span class="font-code text-xs text-tinta-muted" data-cy="genre-shelf-count">{{ (totalCount() ?? books().length) }} libros</span>
      </div>

      <!-- shelf board -->
      <div class="relative">
        <div class="flex items-end px-2 pb-2 overflow-x-auto">
          @for (book of books(); track book.code; let i = $index) {
            <app-book-spine
              [book]="book"
              [colorIndex]="colorOffset() + i"
              [removing]="removingCode() === book.code"
              [appearing]="appearingCode() === book.code"
              (spineClick)="bookClick.emit($event)"
            />
          }
          @if (!books().length) {
            <p class="font-ui text-sm text-tinta-muted py-4">Sin libros en este género.</p>
          }
        </div>
        <!-- shelf line -->
        <div class="h-2 bg-[#8b6914] rounded-sm shadow-sm"></div>
      </div>
    </section>
  `,
})
export class GenreShelfComponent {
  readonly genre         = input.required<string>();
  readonly books         = input<Book[]>([]);
  readonly colorOffset   = input(0);
  readonly removingCode  = input<string | null>(null);
  readonly appearingCode = input<string | null>(null);

  readonly totalCount    = input<number | undefined>(undefined);

  readonly bookClick = output<Book>();
}
