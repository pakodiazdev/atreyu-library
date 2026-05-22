import { Location } from '@angular/common';
import { Component, DestroyRef, OnInit, effect, inject, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { BookListStore } from './book-list.store';
import {
  UiBtnDirective,
  UiInputComponent,
  UiBadgeComponent,
  UiTableDirective,
  UiTableHeaderDirective,
  UiTableRowDirective,
  UiTableCellDirective,
  UiPaginatorComponent,
} from '../../../shared/ui';
import { DrawerService } from '../../../shared/ui/drawer.service';
import { DialogService } from '../../../shared/ui/dialog.service';
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
    UiPaginatorComponent,
  ],
  providers: [BookListStore],
  templateUrl: './book-list.component.html',
})
export class BookListComponent implements OnInit {
  protected readonly store  = inject(BookListStore);
  protected readonly drawer = inject(DrawerService);
  private  readonly dialog  = inject(DialogService);
  private  readonly location = inject(Location);
  private  readonly route    = inject(ActivatedRoute);
  private  readonly router   = inject(Router);
  private  readonly destroyRef = inject(DestroyRef);

  constructor() {
    const initialCreated = this.drawer.bookCreated();
    const initialDeleted = this.dialog.bookDeleted();
    effect(() => {
      if (this.drawer.bookCreated() > initialCreated) this.store.reload();
      if (this.dialog.bookDeleted() > initialDeleted)  this.store.clearFilters();
    });

    const initialUpdated = this.drawer.updateCount();
    effect(() => {
      if (this.drawer.updateCount() > initialUpdated) {
        untracked(() => this.store.reload());
      }
    });

    // Sincroniza el estado del store hacia la URL cada vez que cambia.
    // Solo actúa cuando el drawer está cerrado: si está abierto la URL muestra
    // /libros/... (vía location.replaceState) y no debe sobreescribirse.
    // Al cerrarse el drawer, isOpen() cambia a false → el effect se dispara y
    // restaura la URL del catálogo con los parámetros de paginación vigentes.
    effect(() => {
      const page     = this.store.page();
      const size     = this.store.size();
      const title    = this.store.filterTitle();
      const author   = this.store.filterAuthor();
      const genre    = this.store.filterGenre();
      const isDrawerOpen = this.drawer.isOpen();

      untracked(() => {
        if (isDrawerOpen) return;
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            page:   page  > 0   ? page  : null,
            size:   size === 10   ? null  : size,
            title:  title  || null,
            author: author || null,
            genre:  genre  || null,
          },
          replaceUrl: true,
        });
      });
    });
  }

  ngOnInit(): void {
    const bookSlug = this.route.snapshot.paramMap.get('bookSlug') ?? '';
    const code = extractCodeFromSlug(bookSlug);
    if (code) {
      this.drawer.openDetailFrom(code, '/catalogo');
    }

    // Sincroniza URL → store de forma reactiva para que los cambios externos
    // (edición manual de URL, navegación del historial) actualicen la vista.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const title  = params.get('title');
        const author = params.get('author');
        const genre  = params.get('genre');
        const page   = params.get('page');
        const size   = params.get('size');

        if (title  !== null) this.store.filterTitle.set(title);
        if (author !== null) this.store.filterAuthor.set(author);
        if (genre  !== null) this.store.filterGenre.set(genre);
        if (page   !== null) this.store.page.set(Math.max(0, Number.parseInt(page, 10) || 0));
        if (size   !== null) {
          const parsed = Number.parseInt(size, 10);
          if ([10, 20, 50, 100].includes(parsed)) this.store.setSize(parsed);
        }
      });
  }

  protected openDetail(book: Book): void {
    this.drawer.openDetailFrom(book.code, '/catalogo');
    this.location.replaceState(toBookUrl(book).join('/'));
  }

  protected onFilterChange(field: 'title' | 'author' | 'genre', value: string): void {
    if (field === 'title')  this.store.filterTitle.set(value);
    if (field === 'author') this.store.filterAuthor.set(value);
    if (field === 'genre')  this.store.filterGenre.set(value);
    this.store.page.set(0);
  }

  protected genreVariant(genre: string | null): 'default' | 'gold' | 'moss' | 'rust' {
    if (!genre) return 'default';
    const g = genre.toLowerCase();
    if (g.startsWith('fant')) return 'gold';
    if (g.startsWith('poes')) return 'moss';
    return 'default';
  }
}
