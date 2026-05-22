export interface Book {
  code: string;
  ulid: string;
  title: string;
  author: string;
  genre: string | null;
  publicationYear: number | null;
}

export interface BookDetail extends Book {
  synopsis?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookFilters {
  title?: string;
  author?: string;
  genre?: string;
  page?: number;
  size?: number;
}

export interface BookPage {
  content: Book[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface BookCreatePayload {
  title: string;
  author: string;
  genre: string | null;
  publicationYear: number | null;
  synopsis: string | null;
}

export type BookUpdatePayload = BookCreatePayload;
