import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { SplashComponent } from './splash.component';

function setup(httpResponse: 'ok' | 'error') {
  vi.useFakeTimers();
  const mockHttp = {
    get: vi.fn().mockReturnValue(
      httpResponse === 'ok'
        ? of({ status: 'UP' })
        : throwError(() => new Error('Network error'))
    ),
  };
  TestBed.configureTestingModule({
    imports: [SplashComponent],
    providers: [
      { provide: HttpClient, useValue: mockHttp },
      provideRouter([]),
    ],
  });
  const fixture = TestBed.createComponent(SplashComponent);
  const component = fixture.componentInstance;
  return { fixture, component, mockHttp };
}

describe('SplashComponent', () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('starts in checking state and renders splash screen', () => {
    const { fixture, component } = setup('error');
    fixture.detectChanges();
    vi.advanceTimersByTime(0); // first timer(0) emission
    fixture.detectChanges();

    expect(component.checkState()).toBe('checking');
    expect(fixture.nativeElement.querySelector('[data-cy="splash-screen"]')).toBeTruthy();
  });

  it('transitions to ready and sets departing when backend responds', () => {
    const { fixture, component } = setup('ok');
    fixture.detectChanges();
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(component.checkState()).toBe('ready');
    expect(component.departing()).toBe(true);

    vi.advanceTimersByTime(500); // consume the done.emit setTimeout
  });

  it('transitions to timeout state after 5 failed attempts (~15 s)', () => {
    const { fixture, component } = setup('error');
    fixture.detectChanges();

    vi.advanceTimersByTime(0); // attempt 1
    for (let i = 1; i < 5; i++) vi.advanceTimersByTime(3000); // attempts 2–5
    fixture.detectChanges();

    expect(component.checkState()).toBe('timeout');
  });

  it('transitions to error state after 20 failed attempts (~60 s)', () => {
    const { fixture, component } = setup('error');
    fixture.detectChanges();

    vi.advanceTimersByTime(0); // attempt 1
    for (let i = 1; i < 20; i++) vi.advanceTimersByTime(3000); // attempts 2–20
    fixture.detectChanges();

    expect(component.checkState()).toBe('error');
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });

  it('resets to checking state and restarts polling on retry', () => {
    const { fixture, component } = setup('error');
    fixture.detectChanges();

    // Exhaust all 20 attempts
    vi.advanceTimersByTime(0);
    for (let i = 1; i < 20; i++) vi.advanceTimersByTime(3000);
    fixture.detectChanges();
    expect(component.checkState()).toBe('error');

    component.retry();
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(component.checkState()).toBe('checking');
    expect(component.departing()).toBe(false);
  });
});
