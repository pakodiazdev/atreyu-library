import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiDrawerComponent } from './ui-drawer.component';

describe('UiDrawerComponent', () => {
  let fixture: ComponentFixture<UiDrawerComponent>;
  let component: UiDrawerComponent;
  let el: HTMLElement;

  function setOpen(value: boolean): void {
    fixture.componentRef.setInput('isOpen', value);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiDrawerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiDrawerComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  // ── Visibilidad ──────────────────────────────────────────────────────────

  it('no renderiza el drawer cuando isOpen es false', () => {
    expect(el.querySelector('[data-cy="drawer"]')).toBeNull();
  });

  it('renderiza el drawer cuando isOpen cambia a true', () => {
    setOpen(true);
    expect(el.querySelector('[data-cy="drawer"]')).not.toBeNull();
  });

  it('el panel está presente en el DOM cuando está abierto', () => {
    setOpen(true);
    expect(el.querySelector('[data-cy="drawer-panel"]')).not.toBeNull();
  });

  // ── Cierre ───────────────────────────────────────────────────────────────

  it('emite (closed) al hacer clic en el botón X', () => {
    setOpen(true);
    let emitted = false;
    component.closed.subscribe(() => (emitted = true));
    el.querySelector<HTMLElement>('[data-cy="drawer-close-btn"]')!.click();
    expect(emitted).toBe(true);
  });

  it('emite (closed) al hacer clic en el backdrop', () => {
    setOpen(true);
    let emitted = false;
    component.closed.subscribe(() => (emitted = true));
    el.querySelector<HTMLElement>('[data-cy="drawer-backdrop"]')!.click();
    expect(emitted).toBe(true);
  });

  it('emite (closed) al presionar Escape', () => {
    setOpen(true);
    let emitted = false;
    component.closed.subscribe(() => (emitted = true));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(emitted).toBe(true);
  });

  it('NO emite (closed) con Escape cuando el drawer está cerrado', () => {
    let emitted = false;
    component.closed.subscribe(() => (emitted = true));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(emitted).toBe(false);
  });

  // ── Body scroll lock ─────────────────────────────────────────────────────

  it('bloquea el scroll del body cuando se abre', () => {
    setOpen(true);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('mantiene scroll bloqueado durante la animación de salida', () => {
    setOpen(true);
    setOpen(false);
    // overflow se restaura dentro del setTimeout (al finalizar la transición), no inmediatamente
    expect(document.body.style.overflow).toBe('hidden');
  });

  // ── Header / title ───────────────────────────────────────────────────────

  it('muestra el título cuando se provee', () => {
    fixture.componentRef.setInput('title', 'Detalle del libro');
    setOpen(true);
    const panel = el.querySelector('[data-cy="drawer-panel"]');
    expect(panel?.textContent).toContain('Detalle del libro');
  });

  it('muestra el botón de cierre sin título', () => {
    setOpen(true);
    expect(el.querySelector('[data-cy="drawer-close-btn"]')).not.toBeNull();
  });

  // ── Clases CSS de animación de salida ────────────────────────────────────

  it('aplica translate-x-full al panel cuando isOpen pasa a false (salida)', () => {
    setOpen(true);
    setOpen(false);
    // El panel sigue en DOM durante la transición de salida
    const panel = el.querySelector('[data-cy="drawer-panel"]');
    expect(panel?.className).toContain('translate-x-full');
  });

  // ── Ancho responsivo ─────────────────────────────────────────────────────

  it('incluye clases de ancho responsivo en el panel', () => {
    setOpen(true);
    const panel = el.querySelector('[data-cy="drawer-panel"]');
    expect(panel?.className).toContain('w-full');
    expect(panel?.className).toContain('lg:min-w-[30vw]');
  });

  it('aplica clase de tamaño sm', () => {
    fixture.componentRef.setInput('size', 'sm');
    setOpen(true);
    const panel = el.querySelector('[data-cy="drawer-panel"]');
    expect(panel?.className).toContain('sm:!w-[min(80%,360px)]');
  });

  it('aplica clase de tamaño lg', () => {
    fixture.componentRef.setInput('size', 'lg');
    setOpen(true);
    const panel = el.querySelector('[data-cy="drawer-panel"]');
    expect(panel?.className).toContain('lg:!w-[55%]');
  });
});
