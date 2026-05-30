import { Component, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Location } from '@angular/common';
import { Book } from '../books/book.model';
import { DrawerService } from '../../shared/ui/drawer.service';
import { GenerosRepository } from './generos.repository';
import { GenreShelf, GenreStats } from './generos.model';
import { GenreChipBarComponent } from './genre-chip-bar/genre-chip-bar.component';
import { GenreShelfComponent } from './genre-shelf/genre-shelf.component';

@Component({
  standalone: true,
  selector: 'app-generos',
  imports: [GenreChipBarComponent, GenreShelfComponent],
  template: `
    <div class="p-6 max-w-5xl mx-auto">
      <h1 class="font-editorial text-3xl text-tinta mb-6">Géneros</h1>

      <!-- chip bar -->
      <div class="mb-8">
        <app-genre-chip-bar
          [genres]="allGenres()"
          [selected]="activeGenres()"
          [loading]="genresResource.isLoading()"
          (genreToggle)="toggleGenre($event)"
        />
      </div>

      <!-- shelves -->
      @if (shelvesResource.isLoading()) {
        <div class="space-y-10">
          @for (_ of skeletons; track $index) {
            <div class="space-y-2">
              <div class="h-6 w-40 bg-tinta/8 rounded animate-pulse"></div>
              <div class="flex gap-1">
                @for (__ of spineSkeletons; track $index) {
                  <div class="w-10 h-36 bg-tinta/8 rounded-sm animate-pulse"></div>
                }
              </div>
              <div class="h-2 bg-tinta/15 rounded-sm"></div>
            </div>
          }
        </div>
      } @else {
        @for (shelf of shelves(); track shelf.genre) {
          <app-genre-shelf
            [genre]="shelf.genre"
            [books]="shelf.books"
            [totalCount]="shelf.totalCount"
            [colorOffset]="$index * 3"
            [removingCode]="removingCode()"
            [appearingCode]="appearingCode()"
            (bookClick)="openDetail($event)"
          />
        }
      }
    </div>
  `,
})
export class GenerosComponent implements OnInit {
  private readonly repo     = inject(GenerosRepository);
  private readonly router   = inject(Router);
  private readonly route    = inject(ActivatedRoute);
  private readonly drawer   = inject(DrawerService);
  private readonly location = inject(Location);

  readonly activeGenres = signal<string[]>([]);

  readonly genresResource = rxResource<GenreStats[], void>({
    stream: () => this.repo.getGenres(),
  });

  readonly allGenres = computed<GenreStats[]>(() => this.genresResource.value() ?? []);

  readonly shelvesResource = rxResource<GenreShelf[], string[]>({
    params: () => {
      const active = this.activeGenres();
      return active.length
        ? active
        : (this.genresResource.value() ?? []).map(g => g.genre);
    },
    stream: ({ params: genres }) => {
      if (!genres.length) return of([] as GenreShelf[]);
      return forkJoin(
        genres.map(genre =>
          this.repo.getBooksByGenre(genre).pipe(
            map(page => ({ genre, books: page.content, totalCount: page.totalElements } satisfies GenreShelf))
          )
        )
      );
    },
  });

  readonly removingCode  = signal<string | null>(null);
  readonly appearingCode = signal<string | null>(null);
  private readonly removedCodes = signal<Set<string>>(new Set());

  readonly shelves = computed<GenreShelf[]>(() => {
    const raw     = this.shelvesResource.value() ?? [];
    const removed = this.removedCodes();
    if (!removed.size) return raw;
    return raw.map(shelf => ({
      ...shelf,
      books: shelf.books.filter(b => !removed.has(b.code)),
    }));
  });

  protected readonly skeletons      = new Array(3);
  protected readonly spineSkeletons = new Array(8);

  constructor() {
    effect(() => {
      const code = this.drawer.deletedBookCode();
      if (!code) return;
      this.removingCode.set(code);
      setTimeout(() => {
        this.removedCodes.update(s => new Set([...s, code]));
        this.removingCode.set(null);
        this.drawer.clearDeletedBookCode();
      }, 700);
    });

    effect(() => {
      const book = this.drawer.createdBook();
      if (!book?.genre) return;

      const genre  = book.genre;
      const active = untracked(() => this.activeGenres());
      const isVisible = active.length === 0 || active.includes(genre);

      this.appearingCode.set(book.code);
      setTimeout(() => this.appearingCode.set(null), 1500);

      if (isVisible) {
        this.shelvesResource.reload();
      } else {
        this.activeGenres.set([genre]);
        this.syncUrl([genre]);
      }
    });
  }

  ngOnInit(): void {
    const paramGenre  = this.route.snapshot.paramMap.get('genero');
    const queryGenres = this.route.snapshot.queryParamMap.getAll('generos[]');

    if (paramGenre) {
      this.activeGenres.set([paramGenre]);
    } else if (queryGenres.length) {
      this.activeGenres.set(queryGenres);
    }
  }

  toggleGenre(genre: string): void {
    const current = this.activeGenres();
    const next = current.includes(genre)
      ? current.filter(g => g !== genre)
      : [...current, genre];

    this.activeGenres.set(next);
    this.syncUrl(next);
  }

  openDetail(book: Book): void {
    const returnUrl = this.location.path() || '/generos';
    this.drawer.openDetailFrom(book.code, returnUrl);
  }

  private syncUrl(genres: string[]): void {
    if (genres.length === 0) {
      this.router.navigate(['/generos']);
    } else if (genres.length === 1) {
      this.router.navigate(['/generos', genres[0]]);
    } else {
      // Usamos la misma clave 'generos[]' para todos, que coincide con getAll() en ngOnInit
      this.router.navigate(['/generos'], { queryParams: { 'generos[]': genres } });
    }
  }
}
