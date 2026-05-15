import { toSlug, toBookUrl, extractCodeFromSlug } from './book-url.util';

describe('toSlug()', () => {
  it('converts to lowercase', () => {
    expect(toSlug('Hola Mundo')).toBe('hola-mundo');
  });

  it('removes diacritics', () => {
    expect(toSlug('Cien años de soledad')).toBe('cien-anos-de-soledad');
    expect(toSlug('García Márquez')).toBe('garcia-marquez');
  });

  it('replaces spaces with hyphens', () => {
    expect(toSlug('El Señor de los Anillos')).toBe('el-senor-de-los-anillos');
  });

  it('removes special characters', () => {
    expect(toSlug('J.R.R. Tolkien')).toBe('j-r-r-tolkien');
  });

  it('collapses multiple separators into one hyphen', () => {
    expect(toSlug('Don  Quijote')).toBe('don-quijote');
  });

  it('strips leading and trailing hyphens', () => {
    expect(toSlug(' hello ')).toBe('hello');
  });
});

describe('toBookUrl()', () => {
  it('generates the correct URL segments', () => {
    const result = toBookUrl({
      author: 'Gabriel García Márquez',
      code: 'A01',
      title: 'Cien años de soledad',
      publicationYear: 1967,
    });
    expect(result).toEqual([
      '/libros',
      'gabriel-garcia-marquez',
      'A01-cien-anos-de-soledad-1967',
    ]);
  });

  it('omits year when publicationYear is null', () => {
    const result = toBookUrl({
      author: 'Homero',
      code: 'B01',
      title: 'La Odisea',
      publicationYear: null,
    });
    expect(result[2]).toBe('B01-la-odisea');
  });

  it('omits year when publicationYear is undefined', () => {
    const result = toBookUrl({ author: 'Homero', code: 'B01', title: 'La Odisea' });
    expect(result[2]).toBe('B01-la-odisea');
  });
});

describe('extractCodeFromSlug()', () => {
  it('extracts code from a valid bookSlug', () => {
    expect(extractCodeFromSlug('A01-cien-anos-de-soledad-1967')).toBe('A01');
  });

  it('extracts code when there is no title part', () => {
    expect(extractCodeFromSlug('B05')).toBe('B05');
  });

  it('returns empty string for invalid slug', () => {
    expect(extractCodeFromSlug('invalid-slug')).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(extractCodeFromSlug('')).toBe('');
  });
});
