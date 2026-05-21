import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { BookRepository } from '../book.repository';
import { BookDetail } from '../book.model';
import { DialogService } from '../../../shared/ui/dialog.service';
import { DrawerService } from '../../../shared/ui/drawer.service';

@Injectable()
export class BookDetailStore {
  private readonly repo   = inject(BookRepository);
  private readonly router = inject(Router);
  private readonly dialog = inject(DialogService);
  private readonly drawer = inject(DrawerService);

  readonly code = signal('');

  private readonly resource = rxResource<BookDetail, string>({
    params: () => this.code(),
    stream: ({ params }) => params ? this.repo.getByCode(params) : EMPTY,
  });

  readonly book      = computed(() => this.resource.value() ?? null);
  readonly isLoading = this.resource.isLoading;
  readonly error     = this.resource.error;

  readonly notFound = computed(() => {
    if (!this.code()) return true;
    const err = this.resource.error();
    return err instanceof HttpErrorResponse && err.status === 404;
  });

  setCode(code: string): void {
    this.code.set(code);
  }

  reload(): void {
    this.resource.reload();
  }

  requestDelete(): void {
    const book = this.book();
    if (!book) return;
    this.dialog.openBookDelete(book.code, book.ulid);
  }

  goBack(): void {
    this.router.navigateByUrl(this.drawer.returnUrl());
  }
}
