import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookCreatePayload, BookDetail, BookFilters, BookPage, BookUpdatePayload } from './book.model';

/** Capa HTTP pura. Sin estado ni efectos secundarios — solo llamadas al API. */
@Injectable({ providedIn: 'root' })
export class BookRepository {
  private readonly http = inject(HttpClient);

  getAll(filters?: BookFilters): Observable<BookPage> {
    let params = new HttpParams();
    if (filters?.title)  params = params.set('title',  filters.title);
    if (filters?.author) params = params.set('author', filters.author);
    if (filters?.genre)  params = params.set('genre',  filters.genre);
    params = params.set('page', String(filters?.page ?? 0));
    params = params.set('size', String(filters?.size ?? 10));
    return this.http.get<BookPage>('/books', { params });
  }

  getByCode(code: string): Observable<BookDetail> {
    return this.http.get<BookDetail>(`/books/${code}`);
  }

  create(payload: BookCreatePayload): Observable<BookDetail> {
    return this.http.post<BookDetail>('/books', payload);
  }

  update(ulid: string, payload: BookUpdatePayload): Observable<BookDetail> {
    return this.http.put<BookDetail>(`/books/${ulid}`, payload);
  }

  delete(ulid: string): Observable<void> {
    return this.http.delete<void>(`/books/${ulid}`);
  }
}
