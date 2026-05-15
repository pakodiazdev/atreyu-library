import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Punto central para auditar todos los errores HTTP.
 * Se registra antes de sessionExpiryInterceptor en el array, por lo que en la
 * cadena de respuesta (orden inverso) recibe el error después de sessionExpiry:
 * así los 401 ya fueron gestionados antes de llegar aquí.
 * Reemplazar console.error con el servicio de observabilidad (Sentry, Datadog, etc.).
 */
export const errorAuditInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        // Solo metadatos: no loguear err.error para evitar exponer datos sensibles en producción.
        console.error(`[HTTP ${err.status}] ${req.method} ${req.url}`);
      }
      return throwError(() => err);
    }),
  );
