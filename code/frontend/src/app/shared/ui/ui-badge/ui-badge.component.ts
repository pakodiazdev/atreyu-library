import { computed, Component, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../ui.utils';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-[3px] font-ui text-xs border rounded-full',
  {
    variants: {
      variant: {
        default: 'border-tinta-suave/50 text-tinta-suave bg-papel-claro',
        gold:    'bg-ambar/20 border-oro-oscuro text-oro-oscuro',
        moss:    'bg-musgo/15 border-musgo text-musgo',
        rust:    'bg-oxido/15 border-oxido text-oxido',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

@Component({
  standalone: true,
  selector: 'ui-badge',
  host: {
    '[class]': '_classes()',
  },
  template: `<ng-content />`,
})
export class UiBadgeComponent {
  readonly variant = input<BadgeVariants['variant']>('default');
  readonly class = input<string>('');

  protected readonly _classes = computed(() =>
    cn(badgeVariants({ variant: this.variant() }), this.class())
  );
}
