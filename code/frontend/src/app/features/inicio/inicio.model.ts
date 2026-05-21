export interface DashboardStats {
  totalBooks: number;
  distinctGenres: number;
  addedThisMonth: number;
}

export interface ActivityEntry {
  bookCode: string;
  title: string;
  author: string;
  eventType: 'CREATED' | 'UPDATED';
  occurredAt: string;
}

export interface GenreStats {
  genre: string;
  count: number;
}
