import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { UiBtnDirective } from '../ui-button/ui-button.directive';

export const PAGE_SIZES = [10, 20, 50, 100] as const;

@Component({
  selector: 'ui-paginator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiBtnDirective],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 px-1 font-ui text-sm select-none">

      <!-- Filas por página -->
      <div class="flex items-center gap-2 text-tinta-suave">
        <span class="whitespace-nowrap">Filas por página</span>
        <div class="flex items-center gap-0.5">
          @for (s of _pageSizes; track s) {
            <button
              type="button"
              uiBtn
              [variant]="s === size() ? 'secondary' : 'ghost'"
              size="sm"
              (click)="sizeChange.emit(s)"
              [attr.aria-pressed]="s === size()"
            >{{ s }}</button>
          }
        </div>
      </div>

      <!-- Navegación de páginas -->
      <nav aria-label="Paginación" class="flex items-center gap-0.5">
        <button
          type="button"
          uiBtn variant="ghost" size="icon"
          [disabled]="!hasPrevious()"
          (click)="pageChange.emit(0)"
          aria-label="Primera página"
        >«</button>
        <button
          type="button"
          uiBtn variant="ghost" size="icon"
          [disabled]="!hasPrevious()"
          (click)="pageChange.emit(page() - 1)"
          aria-label="Página anterior"
        >‹</button>

        @for (p of _pageNumbers(); track $index) {
          @if (p === -1) {
            <span class="px-1.5 text-tinta-muted">…</span>
          } @else {
            <button
              type="button"
              uiBtn
              [variant]="p === _safePage() ? 'secondary' : 'ghost'"
              size="icon"
              (click)="pageChange.emit(p)"
              [attr.aria-current]="p === _safePage() ? 'page' : null"
            >{{ p + 1 }}</button>
          }
        }

        <button
          type="button"
          uiBtn variant="ghost" size="icon"
          [disabled]="!hasNext()"
          (click)="pageChange.emit(page() + 1)"
          aria-label="Página siguiente"
        >›</button>
        <button
          type="button"
          uiBtn variant="ghost" size="icon"
          [disabled]="!hasNext()"
          (click)="pageChange.emit(totalPages() - 1)"
          aria-label="Última página"
        >»</button>
      </nav>

      <!-- Resumen -->
      <p class="text-tinta-muted whitespace-nowrap">
        @if (totalElements() > 0) {
          {{ _from() }}–{{ _to() }} de {{ totalElements() }}
        }
      </p>

    </div>
  `,
})
export class UiPaginatorComponent {
  readonly page         = input.required<number>();
  readonly size         = input.required<number>();
  readonly totalElements = input.required<number>();
  readonly totalPages   = input.required<number>();
  readonly hasNext      = input.required<boolean>();
  readonly hasPrevious  = input.required<boolean>();

  readonly pageChange = output<number>();
  readonly sizeChange = output<number>();

  protected readonly _pageSizes = PAGE_SIZES;

  protected readonly _safePage = computed(() =>
    Math.min(Math.max(0, this.page()), Math.max(0, this.totalPages() - 1))
  );

  protected readonly _from = computed(() =>
    this.totalElements() === 0 ? 0 : this._safePage() * this.size() + 1
  );

  protected readonly _to = computed(() =>
    Math.min((this._safePage() + 1) * this.size(), this.totalElements())
  );

  protected readonly _pageNumbers = computed((): number[] => {
    const total = this.totalPages();
    const VISIBLE = 8;

    if (total <= VISIBLE) return Array.from({ length: total }, (_, i) => i);

    const cur  = this.page();
    const half = Math.floor(VISIBLE / 2);

    let start = Math.max(0, cur - half);
    let end   = start + VISIBLE - 1;

    // Ajusta si la ventana sobrepasa el final
    if (end >= total) {
      end   = total - 1;
      start = Math.max(0, end - VISIBLE + 1);
    }

    const pages: number[] = [];

    if (start > 0) {
      pages.push(0);
      if (start > 1) pages.push(-1); // ellipsis
    }

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < total - 1) {
      if (end < total - 2) pages.push(-1); // ellipsis
      pages.push(total - 1);
    }

    return pages;
  });
}
