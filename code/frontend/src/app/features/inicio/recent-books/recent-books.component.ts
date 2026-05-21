import { Component, ElementRef, ViewChild, input, output } from '@angular/core';
import { Book } from '../../books/book.model';
import { BookCardComponent } from './book-card/book-card.component';

/**
 * Carrusel horizontal de los libros añadidos recientemente.
 * Permite scroll con rueda del ratón y navegación con botones de flecha.
 * Se adapta al ancho disponible: si los libros caben, no muestra botones.
 *
 * @input  books   - lista de libros a mostrar
 * @input  loading - activa los skeletons de carga
 * @output bookSelected - emite el libro cuando el usuario hace clic
 */
@Component({
  standalone: true,
  selector: 'app-recent-books',
  imports: [BookCardComponent],
  template: `
    <section>
      <h2 class="font-ui text-xs tracking-widest uppercase text-tinta-suave mb-4">Añadidos recientemente</h2>

      @if (loading()) {
        <!-- Skeleton -->
        <div class="flex gap-3 overflow-hidden">
          @for (_ of skeletons; track $index) {
            <div class="w-[160px] shrink-0 aspect-[3/4] bg-tinta/8 rounded-lg animate-pulse"></div>
          }
        </div>

      } @else if (!books().length) {
        <div class="flex items-center justify-center py-10 border-[1.6px] border-tinta/20 rounded-lg">
          <p class="font-ui text-sm text-tinta-muted">No hay libros en el catálogo todavía.</p>
        </div>

      } @else {
        <div class="relative group">

          <!-- Botón anterior -->
          <button
            type="button"
            aria-label="Desplazar a la izquierda"
            class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-papel-claro/90 border border-tinta/20 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 -translate-x-1/2 hover:bg-papel-claro"
            (click)="scrollBy(-1)"
          >
            ‹
          </button>

          <!-- Contenedor scrollable -->
          <div
            #carousel
            class="flex gap-3 overflow-x-auto scroll-smooth pb-1"
            style="scrollbar-width: none; -ms-overflow-style: none;"
            (wheel)="onWheel($event)"
          >
            @for (book of books(); track book.ulid) {
              <app-book-card [book]="book" (selected)="bookSelected.emit($event)" />
            }
          </div>

          <!-- Botón siguiente -->
          <button
            type="button"
            aria-label="Desplazar a la derecha"
            class="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-papel-claro/90 border border-tinta/20 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 translate-x-1/2 hover:bg-papel-claro"
            (click)="scrollBy(1)"
          >
            ›
          </button>

        </div>
      }
    </section>
  `,
})
export class RecentBooksComponent {
  @ViewChild('carousel') private carouselRef?: ElementRef<HTMLDivElement>;

  readonly books        = input<Book[]>([]);
  readonly loading      = input(false);
  readonly bookSelected = output<Book>();

  protected readonly skeletons = Array(5);

  protected onWheel(event: WheelEvent): void {
    const el = this.carouselRef?.nativeElement;
    if (!el) return;
    event.preventDefault();
    el.scrollLeft += event.deltaY;
  }

  protected scrollBy(direction: 1 | -1): void {
    const el = this.carouselRef?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: direction * 180, behavior: 'smooth' });
  }
}
