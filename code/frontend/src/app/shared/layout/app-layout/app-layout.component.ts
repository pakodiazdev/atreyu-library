import { Component, HostListener, OnInit, computed, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AppSidebarComponent } from '../app-sidebar/app-sidebar.component';
import { AppHeaderComponent } from '../app-header/app-header.component';
import { UiDrawerComponent } from '../../ui/ui-drawer/ui-drawer.component';
import { UiDialogComponent } from '../../ui/ui-dialog/ui-dialog.component';
import { UiToastComponent }  from '../../ui/ui-toast/ui-toast.component';
import { DrawerService } from '../../ui/drawer.service';
import { DialogService } from '../../ui/dialog.service';
import { BookDetailComponent } from '../../../features/books/book-detail/book-detail.component';
import { BookFormComponent } from '../../../features/books/book-form/book-form.component';
import { BookDeleteFormComponent } from '../../../features/books/book-delete-form/book-delete-form.component';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    AppSidebarComponent,
    AppHeaderComponent,
    UiDrawerComponent,
    UiDialogComponent,
    UiToastComponent,
    BookDetailComponent,
    BookFormComponent,
    BookDeleteFormComponent,
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
})
export class AppLayoutComponent implements OnInit {
  protected readonly drawer  = inject(DrawerService);
  protected readonly dialog  = inject(DialogService);
  private  readonly router   = inject(Router);
  readonly sidebarOpen = signal(false);

  protected readonly drawerTitle = computed(() => {
    const mode = this.drawer.mode();
    if (mode === 'form') return 'Nuevo libro';
    if (mode === 'edit') return 'Editar libro';
    return undefined;
  });

  constructor() {
    effect(() => {
      if (this.drawer.mode() === 'form') {
        this.router.navigate([], {
          queryParams: { 'nuevo-libro': 'true' },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const { queryParams } = this.router.parseUrl(this.router.url);
        if (queryParams['nuevo-libro'] === 'true' && !this.drawer.isOpen()) {
          this.drawer.openForm();
        }
      });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  closeDrawer(): void {
    const mode = this.drawer.mode();
    if (mode === 'detail' || mode === 'edit') {
      this.router.navigate(['/catalogo'], { replaceUrl: true });
    } else if (mode === 'form') {
      this.router.navigate([], {
        queryParams: { 'nuevo-libro': null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
    this.drawer.close();
  }

  closeDialog(): void {
    this.dialog.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.dialog.isOpen()) return; // UiDialogComponent lo maneja y emite (closed)
    if (this.drawer.isOpen()) {
      this.closeDrawer();
    } else {
      this.closeSidebar();
    }
  }
}
