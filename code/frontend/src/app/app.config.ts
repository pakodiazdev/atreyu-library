import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import * as Sentry from '@sentry/angular';
import { routes } from './app.routes';
import {
  apiBaseInterceptor,
  authInterceptor,
  sessionExpiryInterceptor,
  errorAuditInterceptor,
} from './core/interceptors';
import { environment } from '../environments/environment';

export function buildSentryProviders(dsn: string) {
  return dsn ? [{ provide: ErrorHandler, useValue: Sentry.createErrorHandler() }] : [];
}

export const appConfig: ApplicationConfig = {
  providers: [
    ...buildSentryProviders(environment.sentryDsn),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        apiBaseInterceptor,       // 1. antepone la URL base
        authInterceptor,          // 2. inyecta el token de autenticación
        errorAuditInterceptor,    // 3. audita errores (en respuesta: corre 2°, después de sessionExpiry)
        sessionExpiryInterceptor, // 4. captura 401 → logout (en respuesta: corre 1°)
      ]),
    ),
    provideRouter(routes),
  ]
};
