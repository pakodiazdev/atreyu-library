import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { AppSidebarComponent } from './app-sidebar.component';

describe('AppSidebarComponent', () => {
  function setup(isOpen = false) {
    TestBed.configureTestingModule({
      imports: [AppSidebarComponent],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(AppSidebarComponent);
    fixture.componentRef.setInput('isOpen', isOpen);
    // Stub router navigation to avoid NG0205 after teardown
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }

  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  describe('data-cy attribute', () => {
    it('aside has data-cy="sidebar-drawer"', () => {
      const { el } = setup();
      expect(el.querySelector('[data-cy="sidebar-drawer"]')).toBeTruthy();
    });
  });

  describe('translate classes based on isOpen', () => {
    it('has -translate-x-full when closed', () => {
      const { el } = setup(false);
      const aside = el.querySelector('[data-cy="sidebar-drawer"]')!;
      expect(aside.classList.contains('-translate-x-full')).toBe(true);
      expect(aside.classList.contains('translate-x-0')).toBe(false);
    });

    it('has translate-x-0 when open', () => {
      const { el } = setup(true);
      const aside = el.querySelector('[data-cy="sidebar-drawer"]')!;
      expect(aside.classList.contains('translate-x-0')).toBe(true);
      expect(aside.classList.contains('-translate-x-full')).toBe(false);
    });

    it('updates classes when isOpen input changes', () => {
      const { fixture, el } = setup(false);
      const aside = el.querySelector('[data-cy="sidebar-drawer"]')!;
      expect(aside.classList.contains('-translate-x-full')).toBe(true);

      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      expect(aside.classList.contains('translate-x-0')).toBe(true);
      expect(aside.classList.contains('-translate-x-full')).toBe(false);
    });
  });

  describe('nav items', () => {
    it('renders all nav items', () => {
      const { component, el } = setup();
      const links = el.querySelectorAll('nav a');
      expect(links.length).toBe(component.navItems.length);
    });

    it('emits closed when a nav link is clicked', () => {
      const { fixture, component, el } = setup();
      const spy = vi.fn();
      component.closed.subscribe(spy);

      el.querySelector<HTMLAnchorElement>('nav a')!.click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('emits closed for each nav link click', () => {
      const { fixture, component, el } = setup();
      const spy = vi.fn();
      component.closed.subscribe(spy);

      const links = el.querySelectorAll<HTMLAnchorElement>('nav a');
      links.forEach(link => link.click());
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(links.length);
    });
  });

  describe('default input values', () => {
    it('isOpen defaults to false', () => {
      TestBed.configureTestingModule({
        imports: [AppSidebarComponent],
        providers: [provideRouter([])],
      });
      const fixture = TestBed.createComponent(AppSidebarComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.isOpen()).toBe(false);
      TestBed.resetTestingModule();
    });
  });
});
