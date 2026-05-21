import { Injectable, computed, signal } from '@angular/core';

export type DrawerMode = 'detail' | 'form' | 'edit' | null;

@Injectable({ providedIn: 'root' })
export class DrawerService {
  private readonly _mode        = signal<DrawerMode>(null);
  private readonly _bookCode    = signal<string | null>(null);
  private readonly _created     = signal(0);
  private readonly _updateCount = signal(0);
  private readonly _returnUrl   = signal('/catalogo');

  readonly mode        = this._mode.asReadonly();
  readonly bookCode    = this._bookCode.asReadonly();
  readonly isOpen      = computed(() => this._mode() !== null);
  readonly bookCreated = this._created.asReadonly();
  readonly updateCount = this._updateCount.asReadonly();
  /** URL a la que navegar al cerrar el panel de detalle o edición. */
  readonly returnUrl   = this._returnUrl.asReadonly();

  openDetail(code: string): void {
    this._bookCode.set(code);
    this._mode.set('detail');
  }

  /** Abre el detalle y guarda la ruta de retorno para cuando se cierre el drawer. */
  openDetailFrom(code: string, returnUrl: string): void {
    this._returnUrl.set(returnUrl);
    this.openDetail(code);
  }

  openForm(): void {
    this._bookCode.set(null);
    this._mode.set('form');
  }

  openEdit(code: string): void {
    this._bookCode.set(code);
    this._mode.set('edit');
  }

  close(): void {
    this._mode.set(null);
    this._bookCode.set(null);
  }

  notifyBookCreated(): void {
    this._created.update(n => n + 1);
    this.close();
  }

  notifyBookUpdated(): void {
    this._updateCount.update(n => n + 1);
    this._mode.set('detail');
  }
}
