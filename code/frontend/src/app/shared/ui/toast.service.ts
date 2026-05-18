import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

const AUTO_DISMISS_MS = 4000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _counter = 0;
  readonly toasts = signal<Toast[]>([]);

  show(message: string, variant: ToastVariant = 'success', delayMs = 0): void {
    const id = ++this._counter;
    setTimeout(() => {
      this.toasts.update(list => [...list, { id, message, variant }]);
      setTimeout(() => this.dismiss(id), AUTO_DISMISS_MS);
    }, delayMs);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
