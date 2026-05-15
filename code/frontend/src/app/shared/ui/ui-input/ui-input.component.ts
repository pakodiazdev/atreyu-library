import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../ui.utils';

const inputVariants = cva(
  'block w-full font-ui text-[15px] text-tinta bg-papel-claro placeholder:text-tinta-muted'
  + ' focus:outline-none transition-colors disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default:
          'border-[1.5px] border-tinta-suave/70 rounded-lg px-3 py-2 focus:border-tinta',
        ghost:
          'border-0 border-b-[1.5px] border-tinta-suave/50 rounded-none px-0 py-1.5 focus:border-tinta',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export type UiInputVariants = VariantProps<typeof inputVariants>;

/**
 * Componente de input con estilos centralizados y binding bidireccional con señales.
 *
 * Uso básico:
 *   <ui-input placeholder="Buscar…" [(value)]="mySignal" />
 *
 * El host usa `display: contents` para ser transparente al flex layout:
 * el <input> interno actúa directamente como flex item, por lo que las
 * clases de layout (flex-1, min-w-*, etc.) se pasan en el propio atributo class.
 *
 * El identificador de pruebas se declara como input `testId` (no alias),
 * lo que evita que Angular lo propague al host y garantiza un único elemento
 * con `data-cy` en el DOM para los selectores de Cypress.
 *
 *   <ui-input testId="mi-campo" placeholder="…" [(value)]="filtro" />
 */
@Component({
  selector: 'ui-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // display: contents hace que el host no genere caja propia;
  // el <input> interno pasa a ser flex/grid item directamente.
  host: { class: 'contents' },
  template: `
    <input
      [type]="type()"
      [placeholder]="placeholder()"
      [value]="value()"
      (input)="value.set($any($event.target).value)"
      [attr.data-cy]="testId()"
      [class]="classes()"
    />
  `,
})
export class UiInputComponent {
  /** Tipo de input HTML. Por defecto: 'text'. */
  readonly type = input<string>('text');

  /** Texto placeholder del campo. */
  readonly placeholder = input<string>('');

  /** Variante visual (default | ghost). */
  readonly variant = input<UiInputVariants['variant']>('default');

  /**
   * Clases adicionales mezcladas con las de la variante.
   * Controla el layout del <input> dentro del flex container:
   *   <ui-input class="flex-1 min-w-[160px]" … />
   */
  readonly class = input<string>('');

  /** Valor del campo — compatible con two-way binding de señales: [(value)]="mySignal". */
  readonly value = model<string>('');

  /**
   * Identificador de pruebas — se mapea al atributo `data-cy` del `<input>` interno.
   * Al declararlo como input propio (no alias), Angular no lo replica en el host,
   * así `cy.get('[data-cy="..."]')` encuentra exactamente un elemento.
   *
   *   <ui-input testId="filter-title" … />  →  cy.get('[data-cy="filter-title"]')
   */
  readonly testId = input<string | null>(null);

  protected readonly classes = computed(() =>
    cn(inputVariants({ variant: this.variant() }), this.class()),
  );
}
