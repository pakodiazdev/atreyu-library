import { Injectable, computed, signal } from '@angular/core';

export type DialogMode = 'book-delete' | null;

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly _mode     = signal<DialogMode>(null);
  private readonly _bookCode = signal<string | null>(null);
  private readonly _bookUlid = signal<string | null>(null);
  private readonly _deleted  = signal(0);

  readonly mode        = this._mode.asReadonly();
  readonly bookCode    = this._bookCode.asReadonly();
  readonly bookUlid    = this._bookUlid.asReadonly();
  readonly isOpen      = computed(() => this._mode() !== null);
  readonly bookDeleted = this._deleted.asReadonly();

  openBookDelete(code: string, ulid: string): void {
    this._bookCode.set(code);
    this._bookUlid.set(ulid);
    this._mode.set('book-delete');
  }

  close(): void {
    this._mode.set(null);
    this._bookCode.set(null);
    this._bookUlid.set(null);
  }

  notifyBookDeleted(): void {
    this._deleted.update(n => n + 1);
    this.close();
  }
}
