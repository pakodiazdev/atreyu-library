import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Inyecta el token Bearer en cada petición al API.
 * Cuando se implemente auth, reemplazar `getToken()` con la señal real del store.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getToken();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

function getToken(): string | null {
  return null;
}
