import { TestBed } from '@angular/core/testing';
import { RecentActivityComponent } from './recent-activity.component';
import { ActivityEntry } from '../inicio.model';

const ENTRIES: ActivityEntry[] = [
  { bookCode: 'A01', title: 'El Quijote', author: 'Cervantes', eventType: 'CREATED', occurredAt: '2026-05-21T10:00:00Z' },
  { bookCode: 'B02', title: 'La Odisea', author: 'Homero', eventType: 'UPDATED', occurredAt: '2026-05-20T15:00:00Z' },
];

function setup(entries: ActivityEntry[] = [], loading = false) {
  TestBed.configureTestingModule({ imports: [RecentActivityComponent] });
  const fixture = TestBed.createComponent(RecentActivityComponent);
  fixture.componentRef.setInput('entries', entries);
  fixture.componentRef.setInput('loading', loading);
  fixture.detectChanges();
  return { el: fixture.nativeElement as HTMLElement };
}

describe('RecentActivityComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders skeleton rows when loading', () => {
    const { el } = setup([], true);
    expect(el.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows empty state when no entries and not loading', () => {
    const { el } = setup([]);
    expect(el.textContent).toContain('Sin actividad registrada.');
  });

  it('renders one activity-item per entry', () => {
    const { el } = setup(ENTRIES);
    expect(el.querySelectorAll('app-activity-item').length).toBe(2);
  });
});
