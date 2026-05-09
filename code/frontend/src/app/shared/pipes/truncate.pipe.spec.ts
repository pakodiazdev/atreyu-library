import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it('returns the value unchanged when shorter than maxLength', () => {
    expect(pipe.transform('Hello', 10)).toBe('Hello');
  });

  it('returns the value unchanged when equal to maxLength', () => {
    expect(pipe.transform('Hello', 5)).toBe('Hello');
  });

  it('truncates and appends ellipsis when longer than maxLength', () => {
    expect(pipe.transform('Hello World', 5)).toBe('Hello…');
  });

  it('uses custom suffix when provided', () => {
    expect(pipe.transform('Hello World', 5, '...')).toBe('Hello...');
  });

  it('returns empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('handles maxLength of zero by truncating everything', () => {
    expect(pipe.transform('Hello', 0)).toBe('…');
  });
});
