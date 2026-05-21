import { Component, input } from '@angular/core';
import { ActivityEntry } from '../inicio.model';
import { ActivityItemComponent } from './activity-item/activity-item.component';

/**
 * Sección de actividad reciente del catálogo.
 * Solo muestra eventos de creación y edición; las eliminaciones no se registran.
 *
 * @input  entries - lista de entradas de actividad
 * @input  loading - activa los skeletons de carga
 */
@Component({
  standalone: true,
  selector: 'app-recent-activity',
  imports: [ActivityItemComponent],
  template: `
    <section>
      <h2 class="font-ui text-xs tracking-widest uppercase text-tinta-suave mb-4">Actividad reciente</h2>

      <div class="border-[1.6px] border-tinta/20 rounded-lg overflow-hidden">
        @if (loading()) {
          <div class="divide-y divide-tinta/10">
            @for (_ of skeletons; track $index) {
              <div class="flex items-center gap-3 px-4 py-3">
                <div class="w-6 h-6 rounded-full bg-tinta/8 animate-pulse shrink-0"></div>
                <div class="flex-1 space-y-1.5">
                  <div class="h-3.5 w-3/4 bg-tinta/8 rounded animate-pulse"></div>
                  <div class="h-3 w-1/2 bg-tinta/8 rounded animate-pulse"></div>
                </div>
                <div class="h-3 w-16 bg-tinta/8 rounded animate-pulse shrink-0"></div>
              </div>
            }
          </div>

        } @else if (!entries().length) {
          <div class="flex flex-col items-center justify-center py-10 px-4 text-center">
            <span class="font-annotation text-3xl text-tinta-muted">◫</span>
            <p class="font-ui text-sm text-tinta-muted mt-2">Sin actividad registrada.</p>
          </div>

        } @else {
          <div class="divide-y divide-tinta/10 px-4">
            @for (entry of entries(); track entry.bookCode + entry.occurredAt) {
              <app-activity-item [entry]="entry" />
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class RecentActivityComponent {
  readonly entries = input<ActivityEntry[]>([]);
  readonly loading = input(false);

  protected readonly skeletons = Array(5);
}
