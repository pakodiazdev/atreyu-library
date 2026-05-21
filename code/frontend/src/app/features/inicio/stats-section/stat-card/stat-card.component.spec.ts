import { TestBed } from '@angular/core/testing';
import { StatCardComponent } from './stat-card.component';

function setup(value: number | null, label: string, loading = false) {
  TestBed.configureTestingModule({ imports: [StatCardComponent] });
  const fixture = TestBed.createComponent(StatCardComponent);
  fixture.componentRef.setInput('value', value);
  fixture.componentRef.setInput('label', label);
  fixture.componentRef.setInput('loading', loading);
  fixture.detectChanges();
  return { el: fixture.nativeElement as HTMLElement };
}

describe('StatCardComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders the value when not loading', () => {
    const { el } = setup(42, 'Libros catalogados');
    expect(el.textContent).toContain('42');
  });

  it('renders the label when not loading', () => {
    const { el } = setup(42, 'Libros catalogados');
    expect(el.textContent).toContain('Libros catalogados');
  });

  it('renders — when value is null', () => {
    const { el } = setup(null, 'Géneros');
    expect(el.textContent).toContain('—');
  });

  it('renders skeleton and hides value when loading', () => {
    const { el } = setup(42, 'Libros catalogados', true);
    expect(el.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(el.textContent).not.toContain('42');
  });
});
