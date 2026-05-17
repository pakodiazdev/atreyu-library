import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, BookCreatePayload, BookDetail, BookFilters } from './book.model';

/** Capa HTTP pura. Sin estado ni efectos secundarios — solo llamadas al API. */
@Injectable({ providedIn: 'root' })
export class BookRepository {
  private readonly http = inject(HttpClient);

  getAll(filters?: BookFilters): Observable<Book[]> {
    let params = new HttpParams();
    if (filters?.title)  params = params.set('title',  filters.title);
    if (filters?.author) params = params.set('author', filters.author);
    if (filters?.genre)  params = params.set('genre',  filters.genre);
    return this.http.get<Book[]>('/books', { params });
  }

  getByCode(code: string): Observable<BookDetail> {
    return this.http.get<BookDetail>(`/books/${code}`);
  }

  create(payload: BookCreatePayload): Observable<BookDetail> {
    return this.http.post<BookDetail>('/books', payload);
  }
}
