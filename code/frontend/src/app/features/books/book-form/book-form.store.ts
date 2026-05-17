import { inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BookRepository } from '../book.repository';
import { BookCreatePayload } from '../book.model';
import { DrawerService } from '../../../shared/ui/drawer.service';

@Injectable()
export class BookFormStore {
  private readonly repo   = inject(BookRepository);
  private readonly drawer = inject(DrawerService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly fieldErrors  = signal<Record<string, string>>({});
  readonly submitError  = signal<string | null>(null);

  submit(payload: BookCreatePayload): void {
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

  cancel(): void {
    this.drawer.close();
  }
}
