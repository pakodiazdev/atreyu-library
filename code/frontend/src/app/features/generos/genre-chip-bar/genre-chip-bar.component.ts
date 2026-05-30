import { Component, input, output } from '@angular/core';
import { GenreStats } from '../generos.model';

/**
 * Barra horizontal de chips de géneros con soporte de selección múltiple.
 * Emite `genreToggle` al pulsar un chip — el padre gestiona la navegación.
 */
@Component({
  standalone: true,
  selector: 'app-genre-chip-bar',
  template: `
    <div class="relative">
      <div
        class="flex flex-wrap gap-2 overflow-y-auto pr-1"
        style="max-height: 9rem;"
      >
        @if (loading()) {
          @for (_ of skeletons; track $index) {
            <div class="h-8 w-24 bg-tinta/8 rounded-full animate-pulse flex-shrink-0"></div>
          }
        } @else {
          @for (genre of genres(); track genre.genre) {
            <button
              (click)="genreToggle.emit(genre.genre)"
              [class.bg-tinta]="selected().includes(genre.genre)"
              [class.text-papel]="selected().includes(genre.genre)"
              [class.border-tinta]="selected().includes(genre.genre)"
              class="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-tinta/20
                     rounded-full font-ui text-[13px] transition-colors cursor-pointer
                     hover:border-tinta/60 hover:bg-tinta/5"
            >
              <span class="text-tinta-suave" [class.text-papel]="selected().includes(genre.genre)">{{ genre.genre }}</span>
              <span class="font-code text-[11px] text-tinta-muted" [class.text-papel]="selected().includes(genre.genre)" style="opacity:0.75">{{ genre.count }}</span>
            </button>
          }
        }
      </div>
      <!-- fade inferior cuando hay scroll -->
      <div class="pointer-events-none absolute bottom-0 left-0 right-2 h-6
                  bg-gradient-to-t from-papel to-transparent"></div>
    </div>
  `,
})
export class GenreChipBarComponent {
  readonly genres   = input<GenreStats[]>([]);
  readonly selected = input<string[]>([]);
  readonly loading  = input(false);

  readonly genreToggle = output<string>();

  protected readonly skeletons = new Array(8);
}
