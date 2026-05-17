import { Component, Input, effect, inject, untracked, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookDetailStore } from './book-detail.store';
import { DrawerService } from '../../../shared/ui/drawer.service';
import { UiBtnDirective, UiBadgeComponent } from '../../../shared/ui';
import { extractCodeFromSlug } from '../../../shared/utils/book-url.util';
import { BookDetail } from '../book.model';

@Component({
  standalone: true,
  selector: 'app-book-detail',
  imports: [UiBtnDirective, UiBadgeComponent],
  providers: [BookDetailStore],
  templateUrl: './book-detail.component.html',
})
export class BookDetailComponent implements OnInit {
  protected readonly store  = inject(BookDetailStore);
  private  readonly route   = inject(ActivatedRoute);
  private  readonly drawer  = inject(DrawerService);

  private bookCodeFromInput = false;

  private readonly mountUpdateCount = this.drawer.updateCount();

  @Input() set bookCode(value: string | null | undefined) {
    if (value) {
      this.bookCodeFromInput = true;
      this.store.setCode(value);
    }
  }

  constructor() {
    effect(() => {
      const current = this.drawer.updateCount();
      if (current > this.mountUpdateCount) {
        untracked(() => this.store.reload());
      }
    });
  }

  ngOnInit(): void {
    if (this.bookCodeFromInput) return;
    const bookSlug = this.route.snapshot.paramMap.get('bookSlug') ?? '';
    this.store.setCode(extractCodeFromSlug(bookSlug));
  }

  openEdit(book: BookDetail): void {
    this.drawer.openEdit(book.code);
  }

  genreVariant(genre: string | null): 'default' | 'gold' | 'moss' | 'rust' {
    if (!genre) return 'default';
    const g = genre.toLowerCase();
    if (g.startsWith('fant')) return 'gold';
    if (g.startsWith('poes')) return 'moss';
    return 'default';
  }

  formatDate(iso: string | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
