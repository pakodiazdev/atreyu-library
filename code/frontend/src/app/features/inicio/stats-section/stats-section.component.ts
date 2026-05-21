import { Component, input } from '@angular/core';
import { StatCardComponent } from './stat-card/stat-card.component';
import { DashboardStats } from '../inicio.model';

/**
 * Sección de estadísticas del dashboard.
 * Muestra tres métricas: libros totales, géneros distintos y añadidos este mes.
 *
 * @input stats   - datos de estadísticas (null durante carga)
 * @input loading - activa los skeletons de carga
 */
@Component({
  standalone: true,
  selector: 'app-stats-section',
  imports: [StatCardComponent],
  template: `
    <section>
      <h2 class="font-ui text-xs tracking-widest uppercase text-tinta-suave mb-4">Estadísticas</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <app-stat-card
          [value]="stats()?.totalBooks ?? null"
          label="Libros catalogados"
          [loading]="loading()"
        />
        <app-stat-card
          [value]="stats()?.distinctGenres ?? null"
          label="Géneros distintos"
          [loading]="loading()"
        />
        <app-stat-card
          [value]="stats()?.addedThisMonth ?? null"
          label="Añadidos este mes"
          [loading]="loading()"
        />
      </div>
    </section>
  `,
})
export class StatsSectionComponent {
  readonly stats   = input<DashboardStats | null>(null);
  readonly loading = input(false);
}
