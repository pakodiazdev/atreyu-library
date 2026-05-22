import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { switchMap, timer } from 'rxjs';
import { BookRepository } from '../book.repository';
import { BookFilters, BookPage } from '../book.model';

/**
 * Gestiona el estado reactivo de la vista de lista de libros.
 * Los componentes leen señales e invocan métodos — sin conocimiento del HTTP.
 */
@Injectable()
export class BookListStore {
  private readonly repo = inject(BookRepository);

  readonly filterTitle  = signal('');
  readonly filterAuthor = signal('');
  readonly filterGenre  = signal('');

  readonly page = signal(0);
  readonly size = signal(10);

  readonly hasActiveFilters = computed(() =>
    !!(this.filterTitle() || this.filterAuthor() || this.filterGenre()),
  );

  private readonly resource = rxResource<BookPage, BookFilters>({
    params: () => ({
      title:  this.filterTitle()  || undefined,
      author: this.filterAuthor() || undefined,
      genre:  this.filterGenre()  || undefined,
      page:   this.page(),
      size:   this.size(),
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

  readonly books         = computed(() => this.resource.value()?.content ?? []);
  readonly totalElements = computed(() => this.resource.value()?.totalElements ?? 0);
  readonly totalPages    = computed(() => this.resource.value()?.totalPages ?? 0);
  readonly hasNext       = computed(() => this.resource.value()?.hasNext ?? false);
  readonly hasPrevious   = computed(() => this.resource.value()?.hasPrevious ?? false);
  readonly isLoading     = this.resource.isLoading;
  readonly error         = this.resource.error;

  setPage(page: number): void {
    this.page.set(page);
  }

  setSize(size: number): void {
    this.size.set(size);
    this.page.set(0);
  }

  clearFilters(): void {
    this.filterTitle.set('');
    this.filterAuthor.set('');
    this.filterGenre.set('');
    this.page.set(0);
  }

  reload(): void {
    this.resource.reload();
  }
}
