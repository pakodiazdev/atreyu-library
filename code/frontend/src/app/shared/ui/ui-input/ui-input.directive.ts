import { computed, Directive, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../ui.utils';

const inputVariants = cva(
  'block w-full font-ui text-[15px] text-tinta bg-papel-claro placeholder:text-tinta-muted focus:outline-none transition-colors disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default:
          'border-[1.5px] border-tinta-suave/70 rounded-lg px-3 py-2 focus:border-tinta',
        ghost:
          'border-0 border-b-[1.5px] border-tinta-suave/50 rounded-none px-0 py-1.5 focus:border-tinta',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type InputVariants = VariantProps<typeof inputVariants>;

@Directive({
  standalone: true,
  selector: 'input[uiInput], textarea[uiInput]',
  host: {
    '[class]': '_classes()',
  },
})
export class UiInputDirective {
  readonly variant = input<InputVariants['variant']>('default');
  readonly class = input<string>('');

  protected readonly _classes = computed(() =>
    cn(inputVariants({ variant: this.variant() }), this.class())
  );
}
