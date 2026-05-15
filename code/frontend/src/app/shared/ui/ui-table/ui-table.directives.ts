import { computed, Directive, input } from '@angular/core';
import { cn } from '../ui.utils';

@Directive({
  standalone: true,
  selector: 'table[uiTable]',
  host: {
    '[class]': '_classes()',
  },
})
export class UiTableDirective {
  readonly class = input<string>('');
  protected readonly _classes = computed(() =>
    cn('w-full border-separate border-spacing-0 text-sm', this.class())
  );
}

@Directive({
  standalone: true,
  selector: 'th[uiTableHeader]',
  host: {
    '[class]': '_classes()',
  },
})
export class UiTableHeaderDirective {
  readonly class = input<string>('');
  protected readonly _classes = computed(() =>
    cn(
      'px-3 py-2.5 font-ui font-normal text-xs text-tinta-suave uppercase tracking-[0.06em] text-left border-b-[1.6px] border-tinta',
      this.class()
    )
  );
}

@Directive({
  standalone: true,
  selector: 'tr[uiTableRow]',
  host: {
    '[class]': '_classes()',
  },
})
export class UiTableRowDirective {
  readonly class = input<string>('');
  protected readonly _classes = computed(() =>
    cn(
      'border-b border-dashed border-tinta-suave/40 last:border-b-0 hover:bg-oro/[0.05] transition-colors',
      this.class()
    )
  );
}

@Directive({
  standalone: true,
  selector: 'td[uiTableCell]',
  host: {
    '[class]': '_classes()',
  },
})
export class UiTableCellDirective {
  readonly class = input<string>('');
  protected readonly _classes = computed(() =>
    cn('px-3 py-2.5 align-middle', this.class())
  );
}
