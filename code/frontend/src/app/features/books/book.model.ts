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
}

export interface BookCreatePayload {
  title: string;
  author: string;
  genre: string | null;
  publicationYear: number | null;
  synopsis: string | null;
}
