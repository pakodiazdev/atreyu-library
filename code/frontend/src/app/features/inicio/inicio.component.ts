import { Component, inject } from '@angular/core';
import { InicioStore } from './inicio.store';
import { DrawerService } from '../../shared/ui/drawer.service';
import { Book } from '../books/book.model';
import { StatsSectionComponent } from './stats-section/stats-section.component';
import { RecentBooksComponent } from './recent-books/recent-books.component';
import { RecentActivityComponent } from './recent-activity/recent-activity.component';
import { GenreListComponent } from './genre-list/genre-list.component';

@Component({
  standalone: true,
  selector: 'app-inicio',
  imports: [
    StatsSectionComponent,
    RecentBooksComponent,
    RecentActivityComponent,
    GenreListComponent,
  ],
  providers: [InicioStore],
  template: `
    <!-- Encabezado -->
    <div class="mb-6">
      <h1 class="font-editorial text-4xl text-tinta leading-none">Biblioteca Atreyu</h1>
      <p class="font-ui text-sm text-tinta-suave mt-1">Panel de inicio</p>
    </div>

    <!-- Grid principal: dos columnas en desktop -->
    <div class="flex flex-col gap-8">

      <!-- Estadísticas: fila completa -->
      <app-stats-section
        [stats]="store.stats()"
        [loading]="store.statsLoading()"
      />

      <!-- Libros recientes: fila completa -->
      <app-recent-books
        [books]="store.recentBooks()"
        [loading]="store.booksLoading()"
        (bookSelected)="openDetail($event)"
      />

      <!-- Actividad reciente + Géneros: dos columnas en desktop -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <app-recent-activity
          [entries]="store.activity()"
          [loading]="store.activityLoading()"
        />
        <app-genre-list
          [genres]="store.genres()"
          [loading]="store.genresLoading()"
        />
      </div>

    </div>
  `,
})
export class InicioComponent {
  protected readonly store  = inject(InicioStore);
  private  readonly drawer  = inject(DrawerService);

  protected openDetail(book: Book): void {
    this.drawer.openDetail(book.code);
  }
}
