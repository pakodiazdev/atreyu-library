import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LibroDetailStore } from './libro-detail.store';
import { UiBtnDirective, UiBadgeComponent } from '../../../shared/ui';

@Component({
  standalone: true,
  selector: 'app-libro-detail',
  imports: [UiBtnDirective, UiBadgeComponent],
  providers: [LibroDetailStore],
  templateUrl: './libro-detail.component.html',
})
export class LibroDetailComponent implements OnInit {
  protected readonly store = inject(LibroDetailStore);
  private  readonly route  = inject(ActivatedRoute);

  ngOnInit(): void {
    const ulid = this.route.snapshot.paramMap.get('ulid') ?? '';
    this.store.setUlid(ulid);
  }

  protected genreVariant(genre: string | null): 'default' | 'gold' | 'moss' | 'rust' {
    if (!genre) return 'default';
    const g = genre.toLowerCase();
    if (g.startsWith('fant')) return 'gold';
    if (g.startsWith('poes')) return 'moss';
    return 'default';
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }
}
