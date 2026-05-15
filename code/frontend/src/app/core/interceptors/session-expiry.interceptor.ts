import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Captura respuestas 401 Unauthorized de forma global y redirige al login
 * desde un único punto, evitando que cada servicio gestione el cierre de
 * sesión por separado. La limpieza de tokens o estado de sesión deberá
 * añadirse aquí cuando se implemente el sistema de autenticación.
 */
export const sessionExpiryInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        router.navigate(['/login'], { replaceUrl: true });
      }
      return throwError(() => err);
    }),
  );
};
