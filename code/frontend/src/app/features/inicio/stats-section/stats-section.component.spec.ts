import { TestBed } from '@angular/core/testing';
import { StatsSectionComponent } from './stats-section.component';
import { DashboardStats } from '../inicio.model';

const STATS: DashboardStats = { totalBooks: 42, distinctGenres: 8, addedThisMonth: 3 };

function setup(stats: DashboardStats | null = null, loading = false) {
  TestBed.configureTestingModule({ imports: [StatsSectionComponent] });
  const fixture = TestBed.createComponent(StatsSectionComponent);
  fixture.componentRef.setInput('stats', stats);
  fixture.componentRef.setInput('loading', loading);
  fixture.detectChanges();
  return { el: fixture.nativeElement as HTMLElement };
}

describe('StatsSectionComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders 3 stat cards', () => {
    const { el } = setup(STATS);
    expect(el.querySelectorAll('app-stat-card').length).toBe(3);
  });

  it('renders values from stats when provided', () => {
    const { el } = setup(STATS);
    expect(el.textContent).toContain('42');
    expect(el.textContent).toContain('8');
    expect(el.textContent).toContain('3');
  });

  it('renders skeletons when loading', () => {
    const { el } = setup(null, true);
    expect(el.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders — when stats is null', () => {
    const { el } = setup(null, false);
    expect(el.textContent).toContain('—');
  });
});
