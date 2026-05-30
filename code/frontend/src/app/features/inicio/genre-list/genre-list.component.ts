import { Component, input, output } from '@angular/core';
import { GenreStats } from '../inicio.model';

/**
 * Lista visual de géneros del catálogo con su conteo de libros.
 * Emite `genreClick` al pulsar un chip — el padre decide la navegación.
 *
 * @input  genres     - lista de géneros con conteo
 * @input  loading    - activa los skeletons de carga
 * @output genreClick - género pulsado
 */
@Component({
  standalone: true,
  selector: 'app-genre-list',
  imports: [],
  template: `
    <section>
      <h2 class="font-ui text-xs tracking-widest uppercase text-tinta-suave mb-4">Géneros</h2>

      @if (loading()) {
        <div class="flex flex-wrap gap-2">
          @for (_ of skeletons; track $index) {
            <div class="h-7 w-24 bg-tinta/8 rounded-full animate-pulse"></div>
          }
        </div>

      } @else if (!genres().length) {
        <p class="font-ui text-sm text-tinta-muted">No hay géneros registrados todavía.</p>

      } @else {
        <div class="flex flex-wrap gap-2">
          @for (genre of genres(); track genre.genre) {
            <button
              (click)="genreClick.emit(genre.genre)"
              class="flex items-center gap-1.5 px-3 py-1.5 border border-tinta/20 rounded-full
                     bg-papel-claro cursor-pointer hover:border-tinta/50 hover:bg-tinta/5
                     transition-colors"
            >
              <span class="font-ui text-[13px] text-tinta-suave">{{ genre.genre }}</span>
              <span class="font-code text-[11px] text-tinta-muted bg-tinta/8 px-1.5 py-0.5 rounded-full">{{ genre.count }}</span>
            </button>
          }
        </div>
      }
    </section>
  `,
})
export class GenreListComponent {
  readonly genres  = input<GenreStats[]>([]);
  readonly loading = input(false);

  readonly genreClick = output<string>();

  protected readonly skeletons = new Array(6);
}
