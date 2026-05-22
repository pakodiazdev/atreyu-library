import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { AppLayoutComponent } from './app-layout.component';
import { DrawerService } from '../../ui/drawer.service';

@Component({ standalone: true, template: '' })
class PageStubComponent {}

describe('AppLayoutComponent', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [AppLayoutComponent],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(AppLayoutComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  describe('sidebarOpen signal', () => {
    it('starts as false', () => {
      const { component } = setup();
      expect(component.sidebarOpen()).toBe(false);
    });

    it('toggleSidebar() sets it to true when false', () => {
      const { component } = setup();
      component.toggleSidebar();
      expect(component.sidebarOpen()).toBe(true);
    });

    it('toggleSidebar() sets it back to false when true', () => {
      const { component } = setup();
      component.toggleSidebar();
      component.toggleSidebar();
      expect(component.sidebarOpen()).toBe(false);
    });

    it('closeSidebar() sets it to false', () => {
      const { component } = setup();
      component.toggleSidebar();
      component.closeSidebar();
      expect(component.sidebarOpen()).toBe(false);
    });

    it('closeSidebar() is a no-op when already false', () => {
      const { component } = setup();
      component.closeSidebar();
      expect(component.sidebarOpen()).toBe(false);
    });
  });

  describe('closeDrawer()', () => {
    it('closes the drawer', () => {
      const { component } = setup();
      const drawer = TestBed.inject(DrawerService);
      const router = TestBed.inject(Router);
      vi.spyOn(router, 'navigateByUrl').mockReturnValue(Promise.resolve(true));
      drawer.openDetail('A01');
      component.closeDrawer();
      expect(drawer.isOpen()).toBe(false);
    });

    it('navigates to /catalogo with replaceUrl when mode is detail', async () => {
      const { component } = setup();
      const drawer = TestBed.inject(DrawerService);
      const router = TestBed.inject(Router);
      const spy = vi.spyOn(router, 'navigateByUrl').mockReturnValue(Promise.resolve(true));
      drawer.openDetail('A01');
      component.closeDrawer();
      expect(spy).toHaveBeenCalledWith('/catalogo', { replaceUrl: true });
    });

    it('navigates to remove ?nuevo-libro when mode is form', () => {
      const { component } = setup();
      const drawer = TestBed.inject(DrawerService);
      const router = TestBed.inject(Router);
      const spy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));
      drawer.openForm();
      component.closeDrawer();
      expect(spy).toHaveBeenCalledWith([], {
        queryParams: { 'nuevo-libro': null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });

    it('adds ?nuevo-libro=true to URL when form opens', () => {
      setup();
      const drawer = TestBed.inject(DrawerService);
      const router = TestBed.inject(Router);
      const spy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));
      drawer.openForm();
      TestBed.flushEffects();
      expect(spy).toHaveBeenCalledWith([], {
        queryParams: { 'nuevo-libro': 'true' },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  });

  describe('onEscape()', () => {
    it('cierra el sidebar cuando no hay drawer abierto', () => {
      const { component } = setup();
      component.toggleSidebar();
      expect(component.sidebarOpen()).toBe(true);
      component.onEscape();
      expect(component.sidebarOpen()).toBe(false);
    });

    it('cierra el drawer cuando está abierto (no el sidebar)', () => {
      const { component } = setup();
      const drawer = TestBed.inject(DrawerService);
      const router = TestBed.inject(Router);
      vi.spyOn(router, 'navigateByUrl').mockReturnValue(Promise.resolve(true));
      component.toggleSidebar();
      drawer.openDetail('A01');
      component.onEscape();
      expect(drawer.isOpen()).toBe(false);
      expect(component.sidebarOpen()).toBe(true);
    });

    it('is a no-op cuando todo está cerrado', () => {
      const { component } = setup();
      component.onEscape();
      expect(component.sidebarOpen()).toBe(false);
    });
  });

  describe('?nuevo-libro=true query param', () => {
    function setupWithRoutes() {
      TestBed.configureTestingModule({
        imports: [AppLayoutComponent],
        providers: [provideRouter([{ path: '**', component: PageStubComponent }])],
      });
      const fixture = TestBed.createComponent(AppLayoutComponent);
      fixture.detectChanges();
      return { fixture, component: fixture.componentInstance };
    }

    it('abre el form drawer al navegar con ?nuevo-libro=true', async () => {
      setupWithRoutes();
      const router = TestBed.inject(Router);
      const drawer = TestBed.inject(DrawerService);

      await router.navigate(['/catalogo'], { queryParams: { 'nuevo-libro': 'true' } });

      expect(drawer.mode()).toBe('form');
    });

    it('no abre el drawer si ya está abierto', async () => {
      setupWithRoutes();
      const router = TestBed.inject(Router);
      const drawer = TestBed.inject(DrawerService);
      drawer.openDetail('A01');

      await router.navigate(['/catalogo'], { queryParams: { 'nuevo-libro': 'true' } });

      expect(drawer.mode()).toBe('detail');
    });

    it('conserva otros query params al cerrar el drawer de form', async () => {
      const { fixture, component } = setupWithRoutes();
      const router = TestBed.inject(Router);
      const drawer = TestBed.inject(DrawerService);

      await router.navigate(['/catalogo'], { queryParams: { q: 'angular', 'nuevo-libro': 'true' } });
      expect(drawer.mode()).toBe('form');

      component.closeDrawer();
      await fixture.whenStable();

      const params = router.parseUrl(router.url).queryParams;
      expect(params['nuevo-libro']).toBeUndefined();
      expect(params['q']).toBe('angular');
    });

  });

  describe('template', () => {
    it('renders backdrop when sidebar is open', () => {
      const { component, fixture } = setup();
      component.toggleSidebar();
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('[data-cy="sidebar-backdrop"]')).toBeTruthy();
    });

    it('does not render backdrop when sidebar is closed', () => {
      const { fixture } = setup();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('[data-cy="sidebar-backdrop"]')).toBeNull();
    });
  });
});
