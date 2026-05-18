import { ErrorHandler } from '@angular/core';
import { buildSentryProviders } from './app.config';

describe('buildSentryProviders', () => {
  it('returns empty array when dsn is empty', () => {
    expect(buildSentryProviders('')).toEqual([]);
  });

  it('registers ErrorHandler provider when dsn is set', () => {
    const providers = buildSentryProviders('https://test@o123.ingest.sentry.io/456');
    expect(providers).toHaveLength(1);
    const provider = providers[0] as { provide: unknown; useValue: unknown };
    expect(provider.provide).toBe(ErrorHandler);
    expect(provider.useValue).toBeDefined();
  });
});
