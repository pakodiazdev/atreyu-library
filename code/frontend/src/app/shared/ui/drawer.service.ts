import { Injectable, computed, signal } from '@angular/core';

export type DrawerMode = 'detail' | 'form' | null;

@Injectable({ providedIn: 'root' })
export class DrawerService {
  private readonly _mode      = signal<DrawerMode>(null);
  private readonly _bookCode  = signal<string | null>(null);
  private readonly _created   = signal(0);

  readonly mode        = this._mode.asReadonly();
  readonly bookCode    = this._bookCode.asReadonly();
  readonly isOpen      = computed(() => this._mode() !== null);
  readonly bookCreated = this._created.asReadonly();

  openDetail(code: string): void {
    this._bookCode.set(code);
    this._mode.set('detail');
  }

  openForm(): void {
    this._bookCode.set(null);
    this._mode.set('form');
  }

  close(): void {
    this._mode.set(null);
    this._bookCode.set(null);
  }

  notifyBookCreated(): void {
    this._created.update(n => n + 1);
    this.close();
  }
}
