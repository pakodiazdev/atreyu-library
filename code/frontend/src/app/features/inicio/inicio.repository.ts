import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../books/book.model';
import { ActivityEntry, DashboardStats, GenreStats } from './inicio.model';

/** Capa HTTP pura para los endpoints del dashboard. Sin estado ni efectos secundarios. */
@Injectable({ providedIn: 'root' })
export class InicioRepository {
  private readonly http = inject(HttpClient);

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>('/dashboard/stats');
  }

  getRecentBooks(): Observable<Book[]> {
    return this.http.get<Book[]>('/dashboard/recent-books');
  }

  getRecentActivity(): Observable<ActivityEntry[]> {
    return this.http.get<ActivityEntry[]>('/dashboard/recent-activity');
  }

  getGenreStats(): Observable<GenreStats[]> {
    return this.http.get<GenreStats[]>('/dashboard/genres');
  }
}
