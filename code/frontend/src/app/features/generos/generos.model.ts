import { Book } from '../books/book.model';

export interface GenreStats {
  genre: string;
  count: number;
}

export interface GenreShelf {
  genre: string;
  books: Book[];
  totalCount?: number;
}
