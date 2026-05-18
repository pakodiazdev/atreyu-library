import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { UiToastComponent } from './ui-toast.component';
import { ToastService, Toast, ToastVariant } from '../toast.service';

type ToastHelpers = { panelClass(v: ToastVariant): string; iconClass(v: ToastVariant): string; icon(v: ToastVariant): string; };
function expose(c: UiToastComponent): ToastHelpers { return c as unknown as ToastHelpers; }

function makeService(toasts: Toast[] = []) {
  return {
    toasts:  signal(toasts),
    dismiss: vi.fn(),
  } as unknown as ToastService;
}

describe('UiToastComponent', () => {
  function configure(toasts: Toast[] = []) {
    const service = makeService(toasts);
    TestBed.configureTestingModule({
      imports:   [UiToastComponent],
      providers: [{ provide: ToastService, useValue: service }],
    });
    const fixture = TestBed.createComponent(UiToastComponent);
    fixture.detectChanges();
    return { fixture, service };
  }

  afterEach(() => TestBed.resetTestingModule());

  // ── panelClass() ────────────────────────────────────────────────────────────

  describe('panelClass()', () => {
    it('contains musgo border for success', () => {
      const { fixture } = configure();
      const cls = expose(fixture.componentInstance).panelClass('success');
      expect(cls).toContain('border-musgo/30');
    });

    it('contains oxido border for error', () => {
      const { fixture } = configure();
      const cls = expose(fixture.componentInstance).panelClass('error');
      expect(cls).toContain('border-oxido/30');
    });

    it('contains oro border for info', () => {
      const { fixture } = configure();
      const cls = expose(fixture.componentInstance).panelClass('info');
      expect(cls).toContain('border-oro/30');
    });
  });

  // ── iconClass() ─────────────────────────────────────────────────────────────

  describe('iconClass()', () => {
    it('returns musgo class for success', () => {
      const { fixture } = configure();
      expect(expose(fixture.componentInstance).iconClass('success')).toContain('text-musgo');
    });

    it('returns oxido class for error', () => {
      const { fixture } = configure();
      expect(expose(fixture.componentInstance).iconClass('error')).toContain('text-oxido');
    });

    it('returns oro class for info', () => {
      const { fixture } = configure();
      expect(expose(fixture.componentInstance).iconClass('info')).toContain('text-oro');
    });
  });

  // ── icon() ──────────────────────────────────────────────────────────────────

  describe('icon()', () => {
    it('returns ✓ for success', () => {
      const { fixture } = configure();
      expect(expose(fixture.componentInstance).icon('success')).toBe('✓');
    });

    it('returns ✕ for error', () => {
      const { fixture } = configure();
      expect(expose(fixture.componentInstance).icon('error')).toBe('✕');
    });

    it('returns i for info', () => {
      const { fixture } = configure();
      expect(expose(fixture.componentInstance).icon('info')).toBe('i');
    });
  });

  // ── template ────────────────────────────────────────────────────────────────

  describe('template', () => {
    it('renders nothing when there are no toasts', () => {
      const { fixture } = configure([]);
      const items = fixture.debugElement.queryAll(By.css('[data-cy="toast"]'));
      expect(items).toHaveLength(0);
    });

    it('renders one element per toast', () => {
      const toasts: Toast[] = [
        { id: 1, message: 'A', variant: 'success' },
        { id: 2, message: 'B', variant: 'error' },
      ];
      const { fixture } = configure(toasts);
      expect(fixture.debugElement.queryAll(By.css('[data-cy="toast"]'))).toHaveLength(2);
    });

    it('calls service.dismiss when the close button is clicked', () => {
      const { fixture, service } = configure([{ id: 42, message: 'Bye', variant: 'info' }]);
      fixture.debugElement.query(By.css('[aria-label="Cerrar notificación"]'))
        .triggerEventHandler('click', null);
      expect(service.dismiss).toHaveBeenCalledWith(42);
    });
  });
});
