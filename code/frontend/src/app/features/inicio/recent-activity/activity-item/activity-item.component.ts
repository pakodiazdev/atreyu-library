import { Component, input } from '@angular/core';
import { ActivityEntry } from '../../inicio.model';

/**
 * Ítem individual de actividad del catálogo.
 *
 * @input entry - entrada de actividad a mostrar
 */
@Component({
  standalone: true,
  selector: 'app-activity-item',
  template: `
    <div class="flex items-start gap-3 py-3">
      <!-- Icono de tipo de evento -->
      <span
        class="mt-0.5 w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-[11px] font-ui"
        [class]="entry().eventType === 'CREATED' ? 'bg-musgo/15 text-musgo' : 'bg-ambar/20 text-oro-oscuro'"
        [title]="entry().eventType === 'CREATED' ? 'Creado' : 'Editado'"
      >
        {{ entry().eventType === 'CREATED' ? '✚' : '✎' }}
      </span>

      <!-- Información del evento -->
      <div class="flex-1 min-w-0">
        <p class="font-editorial text-[14px] text-tinta leading-snug truncate">{{ entry().title }}</p>
        <p class="font-ui text-[12px] text-tinta-suave leading-none mt-0.5 truncate">
          {{ entry().author }} ·
          <span [class]="entry().eventType === 'CREATED' ? 'text-musgo' : 'text-oro-oscuro'">
            {{ entry().eventType === 'CREATED' ? 'Añadido' : 'Editado' }}
          </span>
        </p>
      </div>

      <!-- Fecha -->
      <time
        class="font-annotation text-[11px] text-tinta-muted shrink-0 mt-0.5"
        [dateTime]="entry().occurredAt"
      >
        {{ formatDate(entry().occurredAt) }}
      </time>
    </div>
  `,
})
export class ActivityItemComponent {
  readonly entry = input.required<ActivityEntry>();

  protected formatDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
