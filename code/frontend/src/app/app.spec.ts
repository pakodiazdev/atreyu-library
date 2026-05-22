import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { App } from './app';

describe('App', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    httpMock.verify();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows splash screen on startup before backend responds', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    vi.advanceTimersByTime(0); // dispara timer(0) → petición al health endpoint
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-cy="splash-screen"]')).toBeTruthy();
    expect(compiled.querySelector('app-layout')).toBeFalsy();

    httpMock.expectOne('/health').error(new ProgressEvent('error'));
  });

  it('renders app-layout after backend confirms ready', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    vi.advanceTimersByTime(0); // dispara timer(0) → realiza la primera petición
    httpMock.expectOne('/health').flush({ status: 'UP' });
    fixture.detectChanges();

    vi.advanceTimersByTime(500); // completa el setTimeout del done.emit()
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-layout')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-cy="splash-screen"]')).toBeFalsy();
  });
});
