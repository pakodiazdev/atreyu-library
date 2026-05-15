import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('passes request through without Authorization header when no token is set', () => {
    http.get('/books').subscribe();

    const req = httpMock.expectOne('/books');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('does not modify the request URL when no token is set', () => {
    http.get('/books').subscribe();

    const req = httpMock.expectOne('/books');
    expect(req.request.url).toBe('/books');
    req.flush([]);
  });

  it('does not modify the request method when no token is set', () => {
    http.get('/books').subscribe();

    const req = httpMock.expectOne('/books');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
