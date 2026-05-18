import { Component, inject } from '@angular/core';
import { Toast, ToastService } from '../toast.service';

@Component({
  standalone: true,
  selector: 'ui-toast',
  templateUrl: './ui-toast.component.html',
})
export class UiToastComponent {
  protected readonly service = inject(ToastService);

  protected panelClass(variant: Toast['variant']): string {
    const base = 'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg'
      + ' min-w-64 max-w-sm border animate-toast-in';
    if (variant === 'success') return `${base} bg-papel border-musgo/30`;
    if (variant === 'error')   return `${base} bg-papel border-oxido/30`;
    return                            `${base} bg-papel border-oro/30`;
  }

  protected iconClass(variant: Toast['variant']): string {
    if (variant === 'success') return 'font-ui font-bold text-musgo';
    if (variant === 'error')   return 'font-ui font-bold text-oxido';
    return                            'font-ui font-bold text-oro';
  }

  protected icon(variant: Toast['variant']): string {
    if (variant === 'success') return '✓';
    if (variant === 'error')   return '✕';
    return 'i';
  }
}
