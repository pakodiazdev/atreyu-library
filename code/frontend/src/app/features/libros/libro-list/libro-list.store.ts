import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { switchMap, timer } from 'rxjs';
import { BookRepository } from '../book.repository';
import { Book, BookFilters } from '../book.model';

/**
 * Gestiona el estado reactivo de la vista de lista de libros.
 * Los componentes leen señales e invocan métodos — sin conocimiento del HTTP.
 */
@Injectable()
export class LibroListStore {
  private readonly repo = inject(BookRepository);

  readonly filterTitle  = signal('');
  readonly filterAuthor = signal('');
  readonly filterGenre  = signal('');

  readonly hasActiveFilters = computed(() =>
    !!(this.filterTitle() || this.filterAuthor() || this.filterGenre()),
  );

  private readonly resource = rxResource<Book[], BookFilters>({
    params: () => ({
      title:  this.filterTitle()  || undefined,
      author: this.filterAuthor() || undefined,
      genre:  this.filterGenre()  || undefined,
    }),
    // Sin filtros activos (carga inicial) la petición es inmediata.
    // Con filtros se aplica timer(300); rxResource cancela el Observable
    // anterior en cada cambio de parámetro, reiniciando el timer automáticamente.
    stream: ({ params }) => {
      const hasFilters = params.title || params.author || params.genre;
      return hasFilters
        ? timer(300).pipe(switchMap(() => this.repo.getAll(params)))
        : this.repo.getAll(params);
    },
  });

  readonly books      = computed(() => this.resource.value() ?? []);
  readonly isLoading  = this.resource.isLoading;
  readonly error      = this.resource.error;

  clearFilters(): void {
    this.filterTitle.set('');
    this.filterAuthor.set('');
    this.filterGenre.set('');
  }
}
