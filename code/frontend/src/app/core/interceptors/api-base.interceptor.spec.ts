import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { apiBaseInterceptor } from './api-base.interceptor';
import { environment } from '../../../environments/environment';

describe('apiBaseInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiBaseInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('prepends environment.apiUrl to relative URLs starting with /', () => {
    http.get('/books').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/books`);
    expect(req.request.url).toBe(`${environment.apiUrl}/books`);
    req.flush([]);
  });

  it('prepends apiUrl for other relative paths', () => {
    http.get('/authors').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/authors`);
    expect(req.request.url).toBe(`${environment.apiUrl}/authors`);
    req.flush([]);
  });

  it('passes through absolute URLs unchanged', () => {
    const externalUrl = 'https://external.api/data';
    http.get(externalUrl).subscribe();

    const req = httpMock.expectOne(externalUrl);
    expect(req.request.url).toBe(externalUrl);
    req.flush({});
  });

  it('does not modify URLs that start with http', () => {
    const absoluteUrl = 'http://other-service.local/resource';
    http.get(absoluteUrl).subscribe();

    const req = httpMock.expectOne(absoluteUrl);
    expect(req.request.url).toBe(absoluteUrl);
    req.flush({});
  });
});
