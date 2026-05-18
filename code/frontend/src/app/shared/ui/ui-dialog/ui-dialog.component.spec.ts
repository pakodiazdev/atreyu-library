import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { UiDialogComponent } from './ui-dialog.component';

describe('UiDialogComponent', () => {
  function configure() {
    TestBed.configureTestingModule({ imports: [UiDialogComponent] });
    const fixture = TestBed.createComponent(UiDialogComponent);
    return fixture;
  }

  afterEach(() => {
    document.body.style.overflow = '';
    TestBed.resetTestingModule();
  });

  // ── estado cerrado ──────────────────────────────────────────────────────────

  it('no renderiza el dialog cuando isOpen es false (estado inicial)', () => {
    const f = configure();
    f.detectChanges();
    expect(f.debugElement.query(By.css('[data-cy="dialog"]'))).toBeNull();
  });

  // ── close() ────────────────────────────────────────────────────────────────

  it('close() emite el evento closed', () => {
    const f = configure();
    f.detectChanges();
    const emitted = vi.fn();
    f.componentInstance.closed.subscribe(emitted);
    f.componentInstance.close();
    expect(emitted).toHaveBeenCalled();
  });

  // ── onEscape() ─────────────────────────────────────────────────────────────

  it('onEscape() no emite cuando isOpen es false', () => {
    const f = configure();
    f.detectChanges();
    const emitted = vi.fn();
    f.componentInstance.closed.subscribe(emitted);
    f.componentInstance.onEscape();
    expect(emitted).not.toHaveBeenCalled();
  });

  // ── ngOnDestroy() ──────────────────────────────────────────────────────────

  it('ngOnDestroy() restaura el overflow del body', () => {
    const f = configure();
    f.detectChanges();
    document.body.style.overflow = 'hidden';
    f.componentInstance.ngOnDestroy();
    expect(document.body.style.overflow).toBe('');
  });

  // ── apertura ───────────────────────────────────────────────────────────────

  it('renderiza el panel y muestra el título cuando isOpen es true', () => {
    vi.useFakeTimers();
    const f = configure();
    TestBed.flushEffects();
    f.componentRef.setInput('isOpen', true);
    f.componentRef.setInput('title', 'Eliminar libro');
    TestBed.flushEffects();
    f.detectChanges();

    expect(f.debugElement.query(By.css('[data-cy="dialog"]'))).not.toBeNull();
    expect(f.nativeElement.textContent).toContain('Eliminar libro');
    vi.useRealTimers();
  });

  it('el botón ✕ llama a close()', () => {
    vi.useFakeTimers();
    const f = configure();
    f.componentRef.setInput('isOpen', true);
    TestBed.flushEffects();
    f.detectChanges();

    const emitted = vi.fn();
    f.componentInstance.closed.subscribe(emitted);
    f.debugElement.query(By.css('[data-cy="dialog-close-btn"]'))
      ?.triggerEventHandler('click', null);
    expect(emitted).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('el backdrop click llama a close()', () => {
    vi.useFakeTimers();
    const f = configure();
    f.componentRef.setInput('isOpen', true);
    TestBed.flushEffects();
    f.detectChanges();

    const emitted = vi.fn();
    f.componentInstance.closed.subscribe(emitted);
    f.debugElement.query(By.css('[data-cy="dialog-backdrop"]'))
      ?.triggerEventHandler('click', null);
    expect(emitted).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
