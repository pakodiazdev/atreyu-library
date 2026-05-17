import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { BookRepository } from '../book.repository';
import { BookDetail } from '../book.model';

@Injectable()
export class BookDetailStore {
  private readonly repo   = inject(BookRepository);
  private readonly router = inject(Router);

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

  goBack(): void {
    this.router.navigate(['/catalogo']);
  }
}
