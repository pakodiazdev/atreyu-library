import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Antepone la URL base del API a peticiones cuya URL comienza con `/`.
 * Los repositorios usan rutas relativas como `/books` para no depender
 * de la configuración de entorno.
 */
export const apiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/')) return next(req);
  return next(req.clone({ url: `${environment.apiUrl}${req.url}` }));
};
