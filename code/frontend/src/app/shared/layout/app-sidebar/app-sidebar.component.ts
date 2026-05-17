import { Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DrawerService } from '../../ui/drawer.service';

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
  private readonly drawer = inject(DrawerService);

  readonly isOpen = input<boolean>(false);
  readonly closed = output<void>();

  readonly navItems: NavItem[] = [
    { label: 'Inicio',   path: '/inicio',   icon: '⌂' },
    { label: 'Catálogo', path: '/catalogo', icon: '◫' },
    { label: 'Buscar',   path: '/buscar',   icon: '◎' },
    { label: 'Géneros',  path: '/generos',  icon: '⊞' },
  ];

  openNewBook(): void {
    this.drawer.openForm();
    this.closed.emit();
  }
}
