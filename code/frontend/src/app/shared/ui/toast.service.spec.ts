import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => vi.useRealTimers());

  it('starts with no toasts', () => {
    expect(service.toasts()).toHaveLength(0);
  });

  describe('show()', () => {
    it('adds a toast after the microtask queue flushes (delayMs=0)', () => {
      service.show('Hello');
      vi.advanceTimersByTime(0);
      expect(service.toasts()).toHaveLength(1);
    });

    it('uses success variant by default', () => {
      service.show('Hello');
      vi.advanceTimersByTime(0);
      expect(service.toasts()[0].variant).toBe('success');
    });

    it('uses the given variant', () => {
      service.show('Oops', 'error');
      vi.advanceTimersByTime(0);
      expect(service.toasts()[0].variant).toBe('error');
    });

    it('stores the message', () => {
      service.show('Libro eliminado');
      vi.advanceTimersByTime(0);
      expect(service.toasts()[0].message).toBe('Libro eliminado');
    });

    it('assigns a unique id to each toast', () => {
      service.show('A');
      service.show('B');
      vi.advanceTimersByTime(0);
      const [a, b] = service.toasts();
      expect(a.id).not.toBe(b.id);
    });

    it('delays the toast when delayMs > 0', () => {
      service.show('Delayed', 'info', 400);
      expect(service.toasts()).toHaveLength(0);
      vi.advanceTimersByTime(400);
      expect(service.toasts()).toHaveLength(1);
    });

    it('auto-dismisses the toast after 4000ms', () => {
      service.show('Bye');
      vi.advanceTimersByTime(4000);
      expect(service.toasts()).toHaveLength(0);
    });

    it('does not dismiss before 4000ms', () => {
      service.show('Still here');
      vi.advanceTimersByTime(3999);
      expect(service.toasts()).toHaveLength(1);
    });
  });

  describe('dismiss()', () => {
    it('removes the toast with the given id', () => {
      service.show('A');
      vi.advanceTimersByTime(0);
      const id = service.toasts()[0].id;
      service.dismiss(id);
      expect(service.toasts()).toHaveLength(0);
    });

    it('only removes the matching toast', () => {
      service.show('A');
      service.show('B');
      vi.advanceTimersByTime(0);
      const id = service.toasts()[0].id;
      service.dismiss(id);
      expect(service.toasts()).toHaveLength(1);
      expect(service.toasts()[0].message).toBe('B');
    });

    it('is a no-op for an unknown id', () => {
      service.show('A');
      vi.advanceTimersByTime(0);
      service.dismiss(9999);
      expect(service.toasts()).toHaveLength(1);
    });
  });
});
