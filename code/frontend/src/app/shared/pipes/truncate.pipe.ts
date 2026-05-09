import { Pipe, PipeTransform } from '@angular/core';

/**
 * Truncates a string and appends a suffix when it exceeds the given length.
 * `maxLength` controls the number of characters kept from the original string,
 * not the total output length (i.e. the suffix is appended on top).
 *
 * Usage: {{ longTitle | truncate:50 }}  or  {{ longTitle | truncate:30:'...' }}
 */
@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, maxLength = 50, suffix = '…'): string {
    if (value == null || value.length === 0) {
      return '';
    }
    if (value.length <= maxLength) {
      return value;
    }
    return value.slice(0, maxLength) + suffix;
  }
}
