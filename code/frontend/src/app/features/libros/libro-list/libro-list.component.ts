import { Location } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LibroListStore } from './libro-list.store';
import {
  UiBtnDirective,
  UiInputComponent,
  UiBadgeComponent,
  UiTableDirective,
  UiTableHeaderDirective,
  UiTableRowDirective,
  UiTableCellDirective,
  UiDrawerComponent,
} from '../../../shared/ui';
import { toBookUrl, extractCodeFromSlug } from '../../../shared/utils/book-url.util';
import { Book } from '../book.model';
import { LibroDetailComponent } from '../libro-detail/libro-detail.component';

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
    UiDrawerComponent,
    LibroDetailComponent,
  ],
  providers: [LibroListStore],
  templateUrl: './libro-list.component.html',
})
export class LibroListComponent implements OnInit {
  protected readonly store = inject(LibroListStore);
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);

  protected readonly drawerBookCode = signal<string | null>(null);
  protected readonly isDrawerOpen = signal(false);

  ngOnInit(): void {
    const bookSlug = this.route.snapshot.paramMap.get('bookSlug') ?? '';
    const code = extractCodeFromSlug(bookSlug);
    if (code) {
      this.drawerBookCode.set(code);
      this.isDrawerOpen.set(true);
    }
  }

  protected navigateTo(book: Book): void {
    this.drawerBookCode.set(book.code);
    this.isDrawerOpen.set(true);
    this.location.replaceState(toBookUrl(book).join('/'));
  }

  protected closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.location.replaceState('/catalogo');
  }

  protected genreVariant(genre: string | null): 'default' | 'gold' | 'moss' | 'rust' {
    if (!genre) return 'default';
    const g = genre.toLowerCase();
    if (g.startsWith('fant')) return 'gold';
    if (g.startsWith('poes')) return 'moss';
    return 'default';
  }
}
