import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppLayoutComponent } from './app-layout.component';

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

  describe('onEscape()', () => {
    it('closes the sidebar', () => {
      const { component } = setup();
      component.toggleSidebar();
      expect(component.sidebarOpen()).toBe(true);
      component.onEscape();
      expect(component.sidebarOpen()).toBe(false);
    });

    it('is a no-op when sidebar is already closed', () => {
      const { component } = setup();
      component.onEscape();
      expect(component.sidebarOpen()).toBe(false);
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
