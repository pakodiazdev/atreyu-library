import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { InicioRepository } from './inicio.repository';

/**
 * Gestiona el estado reactivo del dashboard de inicio.
 * Cada sección carga de forma independiente para que un fallo parcial no bloquee las demás.
 */
@Injectable()
export class InicioStore {
  private readonly repo = inject(InicioRepository);

  private readonly statsResource        = rxResource({ stream: () => this.repo.getStats() });
  private readonly recentBooksResource  = rxResource({ stream: () => this.repo.getRecentBooks() });
  private readonly activityResource     = rxResource({ stream: () => this.repo.getRecentActivity() });
  private readonly genresResource       = rxResource({ stream: () => this.repo.getGenreStats() });

  readonly stats         = computed(() => this.statsResource.value()       ?? null);
  readonly recentBooks   = computed(() => this.recentBooksResource.value() ?? []);
  readonly activity      = computed(() => this.activityResource.value()    ?? []);
  readonly genres        = computed(() => this.genresResource.value()      ?? []);

  readonly statsLoading  = this.statsResource.isLoading;
  readonly booksLoading  = this.recentBooksResource.isLoading;
  readonly activityLoading = this.activityResource.isLoading;
  readonly genresLoading   = this.genresResource.isLoading;

  readonly statsError    = this.statsResource.error;
  readonly booksError    = this.recentBooksResource.error;
  readonly activityError = this.activityResource.error;
  readonly genresError   = this.genresResource.error;
}
