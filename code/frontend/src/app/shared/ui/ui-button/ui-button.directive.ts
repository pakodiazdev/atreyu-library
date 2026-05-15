import { computed, Directive, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../ui.utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 font-ui text-[15px] transition-opacity disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-tinta text-papel-claro border-[1.6px] border-tinta rounded-lg shadow-[2px_2px_0_0_var(--color-oro-oscuro)] hover:opacity-90',
        secondary:
          'bg-papel-claro text-tinta border-[1.6px] border-tinta rounded-lg shadow-[2px_2px_0_0_var(--color-tinta)] hover:opacity-90',
        outline:
          'bg-transparent text-tinta-suave border-[1.5px] border-dashed border-tinta-suave/60 rounded-lg hover:text-tinta hover:border-tinta',
        ghost:
          'bg-transparent text-tinta-suave border-0 hover:bg-tinta/8 rounded-lg',
        destructive:
          'bg-oxido text-papel-claro border-[1.6px] border-oxido rounded-lg shadow-[2px_2px_0_0_var(--color-tinta)] hover:opacity-90',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-5 py-2.5 text-base',
        icon: 'p-2',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

@Directive({
  standalone: true,
  selector: 'button[uiBtn], a[uiBtn]',
  host: {
    '[class]': '_classes()',
  },
})
export class UiBtnDirective {
  readonly variant = input<ButtonVariants['variant']>('secondary');
  readonly size = input<ButtonVariants['size']>('md');
  readonly class = input<string>('');

  protected readonly _classes = computed(() =>
    cn(buttonVariants({ variant: this.variant(), size: this.size() }), this.class())
  );
}
