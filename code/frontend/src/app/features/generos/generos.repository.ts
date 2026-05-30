import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../books/book.model';
import { GenreStats } from './generos.model';

@Injectable({ providedIn: 'root' })
export class GenerosRepository {
  private readonly http = inject(HttpClient);

  getGenres(): Observable<GenreStats[]> {
    return this.http.get<GenreStats[]>('/dashboard/genres');
  }

  getBooksByGenre(genre: string): Observable<{ content: Book[]; totalElements: number }> {
    return this.http.get<{ content: Book[]; totalElements: number }>('/books', {
      params: { genre, page: '0', size: '10' },
    });
  }
}
