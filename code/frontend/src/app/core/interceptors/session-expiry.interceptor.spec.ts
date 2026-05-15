import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { vi } from 'vitest';
import { sessionExpiryInterceptor } from './session-expiry.interceptor';

@Component({ template: '' })
class LoginStubComponent {}

describe('sessionExpiryInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([sessionExpiryInterceptor])),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: LoginStubComponent }]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('navigates to /login with replaceUrl when response is 401', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    http.get('/books').subscribe({ error: () => {} });

    httpMock.expectOne('/books').flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(navigateSpy).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('does not navigate when response is 500', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    http.get('/books').subscribe({ error: () => {} });

    httpMock.expectOne('/books').flush(
      { message: 'Server Error' },
      { status: 500, statusText: 'Internal Server Error' },
    );

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('does not navigate when response is 403', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    http.get('/books').subscribe({ error: () => {} });

    httpMock.expectOne('/books').flush(
      { message: 'Forbidden' },
      { status: 403, statusText: 'Forbidden' },
    );

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('does not navigate on successful responses', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    http.get('/books').subscribe();

    httpMock.expectOne('/books').flush([]);

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('rethrows the error after handling a 401', () => {
    let thrownError: unknown;

    http.get('/books').subscribe({ error: (err: unknown) => (thrownError = err) });

    httpMock.expectOne('/books').flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(thrownError).toBeDefined();
  });

  it('rethrows the error for non-401 errors', () => {
    let thrownError: unknown;

    http.get('/books').subscribe({ error: (err: unknown) => (thrownError = err) });

    httpMock.expectOne('/books').flush(
      { message: 'Server Error' },
      { status: 500, statusText: 'Internal Server Error' },
    );

    expect(thrownError).toBeDefined();
  });
});
