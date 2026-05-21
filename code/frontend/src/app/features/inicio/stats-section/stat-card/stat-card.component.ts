import { Component, input } from '@angular/core';

/**
 * Tarjeta de estadística individual del dashboard.
 *
 * @input value  - valor numérico a mostrar (o null durante carga)
 * @input label  - etiqueta descriptiva de la métrica
 * @input loading - muestra skeleton cuando true
 */
@Component({
  standalone: true,
  selector: 'app-stat-card',
  template: `
    <div class="flex flex-col items-center justify-center p-6 bg-papel-claro border-[1.6px] border-tinta/20 rounded-lg text-center min-h-[100px]">
      @if (loading()) {
        <div class="h-10 w-20 bg-tinta/8 rounded animate-pulse mb-2"></div>
        <div class="h-4 w-24 bg-tinta/8 rounded animate-pulse"></div>
      } @else {
        <span class="font-editorial text-4xl text-tinta leading-none">{{ value() ?? '—' }}</span>
        <span class="font-ui text-sm text-tinta-suave mt-2">{{ label() }}</span>
      }
    </div>
  `,
})
export class StatCardComponent {
  readonly value   = input<number | null>(null);
  readonly label   = input.required<string>();
  readonly loading = input(false);
}
