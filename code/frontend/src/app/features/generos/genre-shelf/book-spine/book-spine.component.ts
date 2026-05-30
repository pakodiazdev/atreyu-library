import { Component, input, output } from '@angular/core';
import { Book } from '../../../books/book.model';

const SPINE_COLORS = [
  'bg-[#c9b99a]', 'bg-[#a8c5b5]', 'bg-[#b5a8c5]', 'bg-[#c5b5a8]',
  'bg-[#a8b5c5]', 'bg-[#c5a8b5]', 'bg-[#b5c5a8]', 'bg-[#c5c5a8]',
] as const;

@Component({
  standalone: true,
  selector: 'app-book-spine',
  styles: [`
    @keyframes genreSpineSlideIn {
      from { max-width: 0; margin-right: 0; opacity: 0; transform: scaleY(0.6); }
      to   { max-width: 2.5rem; margin-right: 4px; opacity: 1; transform: scaleY(1); }
    }
  `],
  template: `
    <div
      class="flex-shrink-0 overflow-hidden"
      [style.max-width]="appearing() ? null : (removing() ? '0' : '2.5rem')"
      [style.margin-right]="appearing() ? null : (removing() ? '0' : '4px')"
      [style.opacity]="appearing() ? null : (removing() ? '0' : '1')"
      [style.transition]="removing() ? 'max-width 650ms ease, margin-right 650ms ease, opacity 500ms ease' : 'none'"
      [style.animation]="appearing() ? 'genreSpineSlideIn 700ms cubic-bezier(0.34, 1.56, 0.64, 1) both' : 'none'"
    >
      <button
        (click)="spineClick.emit(book())"
        [class]="spineColor()"
        class="relative w-10 h-36 rounded-sm shadow-md
               cursor-pointer hover:scale-105 hover:-translate-y-1
               transition-transform duration-150 overflow-hidden group"
        [title]="book().title + ' — ' + book().author"
        data-cy="book-spine"
        [attr.data-code]="book().code"
      >
        <span class="absolute inset-0 flex flex-col items-center justify-center p-1
                     writing-vertical font-ui text-[10px] text-tinta/80 leading-tight
                     [writing-mode:vertical-rl] rotate-180">
          {{ book().title }}
        </span>
      </button>
    </div>
  `,
})
export class BookSpineComponent {
  readonly book       = input.required<Book>();
  readonly colorIndex = input(0);
  readonly removing   = input(false);
  readonly appearing  = input(false);

  readonly spineClick = output<Book>();

  protected spineColor(): string {
    return SPINE_COLORS[this.colorIndex() % SPINE_COLORS.length];
  }
}
