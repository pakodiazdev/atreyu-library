import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { BookRepository } from '../book.repository';
import { BookCreatePayload, BookUpdatePayload, BookDetail } from '../book.model';
import { DrawerService } from '../../../shared/ui/drawer.service';

@Injectable()
export class BookFormStore {
  private readonly repo   = inject(BookRepository);
  private readonly drawer = inject(DrawerService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly fieldErrors  = signal<Record<string, string>>({});
  readonly submitError  = signal<string | null>(null);

  private readonly _bookCode = signal<string | null>(null);

  readonly isEditMode = computed(() => this._bookCode() !== null);

  // undefined como params mantiene el resource en estado idle (no llama al stream)
  private readonly bookResource = rxResource<BookDetail, string | undefined>({
    params: () => this._bookCode() ?? undefined,
    stream: ({ params }) => this.repo.getByCode(params),
  });

  readonly editedBook     = computed(() => this.bookResource.value() ?? null);
  readonly isLoadingBook  = this.bookResource.isLoading;
  readonly bookLoadError  = computed(() => this.bookResource.error() ?? null);
  readonly isBookNotFound = computed(() => {
    const err = this.bookResource.error();
    return err instanceof HttpErrorResponse && err.status === 404;
  });

  setBookCode(code: string | null): void {
    this._bookCode.set(code);
    this.fieldErrors.set({});
    this.submitError.set(null);
    this.isSubmitting.set(false);
  }

  submit(payload: BookCreatePayload): void {
    if (this.isEditMode()) {
      this.submitUpdate(payload);
    } else {
      this.submitCreate(payload);
    }
  }

  private submitCreate(payload: BookCreatePayload): void {
    this.isSubmitting.set(true);
    this.fieldErrors.set({});
    this.submitError.set(null);

    this.repo.create(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.drawer.notifyBookCreated();
        this.router.navigate(['/catalogo']);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        if (err.status === 422 && err.error?.errors) {
          this.fieldErrors.set(err.error.errors as Record<string, string>);
        } else {
          this.submitError.set('No se pudo guardar el libro. Inténtalo de nuevo.');
        }
      },
    });
  }

  private submitUpdate(payload: BookUpdatePayload): void {
    const ulid = this.editedBook()?.ulid;
    if (!ulid) {
      this.submitError.set('No hay un libro válido para editar. Regresa al detalle e inténtalo de nuevo.');
      return;
    }

    this.isSubmitting.set(true);
    this.fieldErrors.set({});
    this.submitError.set(null);

    this.repo.update(ulid, payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.drawer.notifyBookUpdated();
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        if (err.status === 422 && err.error?.errors) {
          this.fieldErrors.set(err.error.errors as Record<string, string>);
        } else {
          this.submitError.set('No se pudo guardar los cambios. Inténtalo de nuevo.');
        }
      },
    });
  }

  cancel(): void {
    const code = this._bookCode();
    if (code) {
      this.drawer.openDetail(code);
    } else {
      this.drawer.close();
    }
  }
}
