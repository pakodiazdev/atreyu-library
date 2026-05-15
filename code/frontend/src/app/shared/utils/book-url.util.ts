export function toSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function toBookUrl(book: {
  author: string;
  code: string;
  title: string;
  publicationYear?: number | null;
}): string[] {
  const authorSlug = toSlug(book.author);
  const year = book.publicationYear ? `-${book.publicationYear}` : '';
  const bookSlug = `${book.code}-${toSlug(book.title)}${year}`;
  return ['/libros', authorSlug, bookSlug];
}

export function extractCodeFromSlug(bookSlug: string): string {
  return bookSlug.match(/^([A-Z]\d{2})/)?.[1] ?? '';
}
