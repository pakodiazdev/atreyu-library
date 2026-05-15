export interface Book {
  code: string;
  ulid: string;
  title: string;
  author: string;
  genre: string | null;
  publicationYear: number | null;
}

export interface BookFilters {
  title?: string;
  author?: string;
  genre?: string;
}
