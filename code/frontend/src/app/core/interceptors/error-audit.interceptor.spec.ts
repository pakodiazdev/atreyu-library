import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { errorAuditInterceptor } from './error-audit.interceptor';

describe('errorAuditInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorAuditInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('calls console.error with status and URL on HTTP error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    http.get('/books').subscribe({ error: () => {} });

    httpMock.expectOne('/books').flush(
      { message: 'Server Error' },
      { status: 500, statusText: 'Internal Server Error' },
    );

    expect(consoleSpy).toHaveBeenCalledOnce();
    const [message] = consoleSpy.mock.calls[0];
    expect(message).toContain('[HTTP 500]');
    expect(message).toContain('/books');
  });

  it('includes the request method in the console.error message', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    http.get('/books').subscribe({ error: () => {} });

    httpMock.expectOne('/books').flush(
      {},
      { status: 404, statusText: 'Not Found' },
    );

    const [message] = consoleSpy.mock.calls[0];
    expect(message).toContain('GET');
  });

  it('does not call console.error on successful response', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    http.get('/books').subscribe();

    httpMock.expectOne('/books').flush([]);

    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('rethrows the error after logging', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let thrownError: unknown;

    http.get('/books').subscribe({ error: (err: unknown) => (thrownError = err) });

    httpMock.expectOne('/books').flush(
      { message: 'Bad Gateway' },
      { status: 502, statusText: 'Bad Gateway' },
    );

    expect(thrownError).toBeDefined();
  });

  it('logs 401 errors as well', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    http.get('/secured').subscribe({ error: () => {} });

    httpMock.expectOne('/secured').flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(consoleSpy).toHaveBeenCalledOnce();
    const [message] = consoleSpy.mock.calls[0];
    expect(message).toContain('[HTTP 401]');
  });
});
