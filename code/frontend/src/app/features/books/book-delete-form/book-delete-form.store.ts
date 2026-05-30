import { inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BookRepository } from '../book.repository';
import { DialogService } from '../../../shared/ui/dialog.service';
import { DrawerService } from '../../../shared/ui/drawer.service';
import { ToastService } from '../../../shared/ui/toast.service';

@Injectable()
export class BookDeleteFormStore {
  private readonly repo   = inject(BookRepository);
  private readonly dialog = inject(DialogService);
  private readonly drawer = inject(DrawerService);
  private readonly router = inject(Router);
  private readonly toast  = inject(ToastService);

  readonly isSubmitting = signal(false);
  readonly submitError  = signal<string | null>(null);
  readonly codeError    = signal<string | null>(null);

  readonly bookCode = this.dialog.bookCode;
  readonly bookUlid = this.dialog.bookUlid;

  submit(enteredCode: string): void {
    const expectedCode = this.dialog.bookCode();
    const ulid         = this.dialog.bookUlid();

    if (enteredCode !== expectedCode) {
      this.submitError.set(null);
      this.codeError.set('El código no coincide con el identificador del libro');
      return;
    }

    if (!ulid) return;

    this.isSubmitting.set(true);
    this.submitError.set(null);
    this.codeError.set(null);

    this.repo.delete(ulid).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.show('Libro eliminado del catálogo', 'success', 400);
        const returnUrl    = this.drawer.returnUrl();
        const deletedCode  = expectedCode;
        this.dialog.notifyBookDeleted();
        this.drawer.notifyBookDeleted(deletedCode);
        this.router.navigateByUrl(returnUrl, { replaceUrl: true });
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        const msg = err.status === 404
          ? 'El libro ya no existe en el catálogo.'
          : 'No se pudo eliminar el libro. Inténtalo de nuevo.';
        this.submitError.set(msg);
        this.toast.show(msg, 'error');
      },
    });
  }

  cancel(): void {
    this.dialog.close();
  }
}
