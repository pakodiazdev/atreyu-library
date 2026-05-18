import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full',
  },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./features/inicio/inicio.component').then((m) => m.InicioComponent),
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./features/books/book-list/book-list.component').then(
        (m) => m.BookListComponent
      ),
  },
  {
    path: 'libros/nuevo',
    redirectTo: '/catalogo',
  },
  {
    path: 'libros/:authorSlug/:bookSlug/editar',
    redirectTo: '/catalogo',
  },
  {
    path: 'libros/:authorSlug/:bookSlug',
    loadComponent: () =>
      import('./features/books/book-list/book-list.component').then(
        (m) => m.BookListComponent
      ),
  },
  {
    path: 'buscar',
    loadComponent: () =>
      import('./features/buscar/buscar.component').then((m) => m.BuscarComponent),
  },
  {
    path: 'generos',
    loadComponent: () =>
      import('./features/generos/generos.component').then((m) => m.GenerosComponent),
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
