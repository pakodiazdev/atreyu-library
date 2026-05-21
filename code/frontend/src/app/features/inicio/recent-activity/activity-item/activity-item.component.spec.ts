import { TestBed } from '@angular/core/testing';
import { ActivityItemComponent } from './activity-item.component';
import { ActivityEntry } from '../../inicio.model';

const CREATED_ENTRY: ActivityEntry = {
  bookCode: 'A01', title: 'El Quijote', author: 'Cervantes',
  eventType: 'CREATED', occurredAt: '2026-05-21T10:00:00Z',
};
const UPDATED_ENTRY: ActivityEntry = {
  bookCode: 'B02', title: 'La Odisea', author: 'Homero',
  eventType: 'UPDATED', occurredAt: '2026-05-20T15:30:00Z',
};

function setup(entry: ActivityEntry) {
  TestBed.configureTestingModule({ imports: [ActivityItemComponent] });
  const fixture = TestBed.createComponent(ActivityItemComponent);
  fixture.componentRef.setInput('entry', entry);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement, component: fixture.componentInstance };
}

describe('ActivityItemComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const { component } = setup(CREATED_ENTRY);
    expect(component).toBeTruthy();
  });

  describe('template — CREATED event', () => {
    it('renders title', () => {
      const { el } = setup(CREATED_ENTRY);
      expect(el.textContent).toContain('El Quijote');
    });

    it('renders author', () => {
      const { el } = setup(CREATED_ENTRY);
      expect(el.textContent).toContain('Cervantes');
    });

    it('shows ✚ icon for CREATED events', () => {
      const { el } = setup(CREATED_ENTRY);
      const icon = el.querySelector('span[title]');
      expect(icon?.textContent?.trim()).toBe('✚');
    });

    it('shows Añadido label for CREATED events', () => {
      const { el } = setup(CREATED_ENTRY);
      expect(el.textContent).toContain('Añadido');
    });
  });

  describe('template — UPDATED event', () => {
    it('shows ✎ icon for UPDATED events', () => {
      const { el } = setup(UPDATED_ENTRY);
      const icon = el.querySelector('span[title]');
      expect(icon?.textContent?.trim()).toBe('✎');
    });

    it('shows Editado label for UPDATED events', () => {
      const { el } = setup(UPDATED_ENTRY);
      expect(el.textContent).toContain('Editado');
    });
  });

  describe('formatDate()', () => {
    it('formats a valid ISO date in es-ES locale', () => {
      const { component } = setup(CREATED_ENTRY);
      const result = (component as unknown as { formatDate(iso: string): string }).formatDate('2026-05-21T10:00:00Z');
      expect(result).toContain('2026');
    });

    it('returns — for an invalid date string', () => {
      const { component } = setup(CREATED_ENTRY);
      const result = (component as unknown as { formatDate(iso: string): string }).formatDate('not-a-date');
      expect(result).toBe('—');
    });
  });
});
