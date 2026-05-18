import { TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { UiInputComponent } from './ui-input.component';

@Component({
  standalone: true,
  imports: [UiInputComponent],
  template: `<ui-input [placeholder]="placeholder" [variant]="variant" [testId]="testId" />`,
})
class HostComponent {
  @Input() placeholder = 'Search…';
  @Input() variant: 'default' | 'ghost' = 'default';
  @Input() testId: string | null = 'test-input';
}

function create(inputs: Partial<{ placeholder: string; variant: 'default' | 'ghost'; testId: string | null }> = {}) {
  TestBed.configureTestingModule({ imports: [HostComponent] });
  const f = TestBed.createComponent(HostComponent);
  Object.assign(f.componentInstance, inputs);
  f.detectChanges();
  return f;
}

describe('UiInputComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders an input element', () => {
    const f = create();
    expect(f.nativeElement.querySelector('input')).toBeTruthy();
  });

  it('applies placeholder', () => {
    const f = create({ placeholder: 'Buscar…' });
    expect(f.nativeElement.querySelector('input').placeholder).toBe('Buscar…');
  });

  it('applies data-cy attribute from testId', () => {
    const f = create({ testId: 'my-field' });
    expect(f.nativeElement.querySelector('[data-cy="my-field"]')).toBeTruthy();
  });

  it('applies default variant classes', () => {
    const f = create({ variant: 'default' });
    expect(f.nativeElement.querySelector('input').className).toContain('border-tinta-suave');
  });

  it('applies ghost variant classes', () => {
    const f = create({ variant: 'ghost' });
    expect(f.nativeElement.querySelector('input').className).toContain('border-b-');
  });

  it('renders without data-cy when testId is null', () => {
    const f = create({ testId: null });
    expect(f.nativeElement.querySelector('input').getAttribute('data-cy')).toBeNull();
  });
});
