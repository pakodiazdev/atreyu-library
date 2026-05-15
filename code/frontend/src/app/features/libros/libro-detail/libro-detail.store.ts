import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { BookRepository } from '../book.repository';
import { BookDetail } from '../book.model';

@Injectable()
export class LibroDetailStore {
  private readonly repo   = inject(BookRepository);
  private readonly router = inject(Router);

  readonly ulid = signal('');

  private readonly resource = rxResource<BookDetail, string>({
    params: () => this.ulid(),
    stream: ({ params }) => params ? this.repo.getById(params) : EMPTY,
  });

  readonly book      = computed(() => this.resource.value() ?? null);
  readonly isLoading = this.resource.isLoading;
  readonly error     = this.resource.error;

  readonly notFound = computed(() => {
    const err = this.resource.error();
    return err instanceof HttpErrorResponse && err.status === 404;
  });

  setUlid(ulid: string): void {
    this.ulid.set(ulid);
  }

  goBack(): void {
    this.router.navigate(['/catalogo']);
  }
}
