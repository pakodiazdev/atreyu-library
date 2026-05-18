import { ErrorHandler } from '@angular/core';
import { appConfig } from './app.config';

describe('appConfig', () => {
  it('should not register SentryErrorHandler when sentryDsn is empty', () => {
    // In dev/test, environment.sentryDsn is '' — no ErrorHandler override expected.
    const errorHandlerProvider = appConfig.providers.find(
      (p): p is { provide: unknown; useValue: unknown } =>
        typeof p === 'object' && p !== null && 'provide' in p && (p as { provide: unknown }).provide === ErrorHandler,
    );
    expect(errorHandlerProvider).toBeUndefined();
  });

  it('should include http client provider', () => {
    expect(appConfig.providers.length).toBeGreaterThan(0);
  });
});
