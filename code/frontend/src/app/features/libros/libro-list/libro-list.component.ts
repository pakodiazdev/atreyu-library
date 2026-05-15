import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LibroListStore } from './libro-list.store';
import {
  UiBtnDirective,
  UiInputComponent,
  UiBadgeComponent,
  UiTableDirective,
  UiTableHeaderDirective,
  UiTableRowDirective,
  UiTableCellDirective,
} from '../../../shared/ui';
import { toBookUrl } from '../../../shared/utils/book-url.util';
import { Book } from '../book.model';

@Component({
  standalone: true,
  selector: 'app-libro-list',
  imports: [
    RouterLink,
    UiBtnDirective,
    UiInputComponent,
    UiBadgeComponent,
    UiTableDirective,
    UiTableHeaderDirective,
    UiTableRowDirective,
    UiTableCellDirective,
  ],
  providers: [LibroListStore],
  templateUrl: './libro-list.component.html',
})
export class LibroListComponent {
  protected readonly store = inject(LibroListStore);
  private readonly router = inject(Router);

  protected bookUrl(book: Book): string[] {
    return toBookUrl(book);
  }

  protected navigateTo(book: Book): void {
    this.router.navigate(toBookUrl(book));
  }

  protected genreVariant(genre: string | null): 'default' | 'gold' | 'moss' | 'rust' {
    if (!genre) return 'default';
    const g = genre.toLowerCase();
    if (g.startsWith('fant')) return 'gold';
    if (g.startsWith('poes')) return 'moss';
    return 'default';
  }
}
