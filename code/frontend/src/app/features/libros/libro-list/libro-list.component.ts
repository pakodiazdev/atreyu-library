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

  protected navigateTo(ulid: string): void {
    this.router.navigate(['/libros', ulid]);
  }

  protected genreVariant(genre: string | null): 'default' | 'gold' | 'moss' | 'rust' {
    if (!genre) return 'default';
    const g = genre.toLowerCase();
    if (g.startsWith('fant')) return 'gold';
    if (g.startsWith('poes')) return 'moss';
    return 'default';
  }
}
