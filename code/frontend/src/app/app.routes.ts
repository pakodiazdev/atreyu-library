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
      import('./features/libros/libro-list/libro-list.component').then(
        (m) => m.LibroListComponent
      ),
  },
  {
    path: 'libros/nuevo',
    loadComponent: () =>
      import('./features/libros/libro-form/libro-form.component').then(
        (m) => m.LibroFormComponent
      ),
  },
  {
    path: 'libros/:ulid/editar',
    loadComponent: () =>
      import('./features/libros/libro-form/libro-form.component').then(
        (m) => m.LibroFormComponent
      ),
  },
  {
    path: 'libros/:ulid',
    loadComponent: () =>
      import('./features/libros/libro-detail/libro-detail.component').then(
        (m) => m.LibroDetailComponent
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
