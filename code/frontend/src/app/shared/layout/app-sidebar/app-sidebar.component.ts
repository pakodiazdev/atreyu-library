import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-sidebar.component.html',
  styleUrl: './app-sidebar.component.scss',
})
export class AppSidebarComponent {
  readonly navItems: NavItem[] = [
    { label: 'Inicio',       path: '/inicio',        icon: '⌂' },
    { label: 'Catálogo',     path: '/catalogo',      icon: '◫' },
    { label: 'Buscar',       path: '/buscar',        icon: '◎' },
    { label: 'Añadir libro', path: '/libros/nuevo',  icon: '+' },
    { label: 'Géneros',      path: '/generos',       icon: '⊞' },
  ];
}
