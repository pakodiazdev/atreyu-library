import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AppHeaderComponent } from './app-header.component';

describe('AppHeaderComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [AppHeaderComponent] });
    const fixture = TestBed.createComponent(AppHeaderComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }

  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('renders default title', () => {
    const { el } = setup();
    expect(el.textContent).toContain('Atreyu · biblioteca');
  });

  it('renders custom title via input', () => {
    TestBed.configureTestingModule({ imports: [AppHeaderComponent] });
    const fixture = TestBed.createComponent(AppHeaderComponent);
    fixture.componentRef.setInput('title', 'Mi Biblioteca');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Mi Biblioteca');
    TestBed.resetTestingModule();
  });

  it('renders burger button with data-cy attribute', () => {
    const { el } = setup();
    expect(el.querySelector('[data-cy="burger-menu"]')).toBeTruthy();
  });

  it('emits burgerToggle when burger button is clicked', () => {
    const { fixture, component, el } = setup();
    const spy = vi.fn();
    component.burgerToggle.subscribe(spy);

    el.querySelector<HTMLButtonElement>('[data-cy="burger-menu"]')!.click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('burger button has aria-label', () => {
    const { el } = setup();
    const btn = el.querySelector('[data-cy="burger-menu"]');
    expect(btn?.getAttribute('aria-label')).toBeTruthy();
  });
});
