import { Location } from '@angular/common';
import { Component, OnInit, effect, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookListStore } from './book-list.store';
import {
  UiBtnDirective,
  UiInputComponent,
  UiBadgeComponent,
  UiTableDirective,
  UiTableHeaderDirective,
  UiTableRowDirective,
  UiTableCellDirective,
} from '../../../shared/ui';
import { DrawerService } from '../../../shared/ui/drawer.service';
import { toBookUrl, extractCodeFromSlug } from '../../../shared/utils/book-url.util';
import { Book } from '../book.model';

@Component({
  standalone: true,
  selector: 'app-book-list',
  imports: [
    UiBtnDirective,
    UiInputComponent,
    UiBadgeComponent,
    UiTableDirective,
    UiTableHeaderDirective,
    UiTableRowDirective,
    UiTableCellDirective,
  ],
  providers: [BookListStore],
  templateUrl: './book-list.component.html',
})
export class BookListComponent implements OnInit {
  protected readonly store  = inject(BookListStore);
  protected readonly drawer = inject(DrawerService);
  private  readonly location = inject(Location);
  private  readonly route    = inject(ActivatedRoute);

  constructor() {
    const initialCreated = this.drawer.bookCreated();
    effect(() => {
      if (this.drawer.bookCreated() > initialCreated) {
        this.store.reload();
      }
    });
  }

  ngOnInit(): void {
    const bookSlug = this.route.snapshot.paramMap.get('bookSlug') ?? '';
    const code = extractCodeFromSlug(bookSlug);
    if (code) {
      this.drawer.openDetail(code);
    }
  }

  protected openDetail(book: Book): void {
    this.drawer.openDetail(book.code);
    this.location.replaceState(toBookUrl(book).join('/'));
  }

  protected genreVariant(genre: string | null): 'default' | 'gold' | 'moss' | 'rust' {
    if (!genre) return 'default';
    const g = genre.toLowerCase();
    if (g.startsWith('fant')) return 'gold';
    if (g.startsWith('poes')) return 'moss';
    return 'default';
  }
}
