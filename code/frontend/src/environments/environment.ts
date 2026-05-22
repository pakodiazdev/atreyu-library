// URL relativa — depende del proxy de ng serve (proxy.conf.js, activo en el target "development").
// Fuera de Docker o sin ng serve, configura BACKEND_HOST y BACKEND_PORT en tu .env antes de arrancar.
export const environment = {
  production: false,
  apiUrl: '/api/v1',
  sentryDsn: '',
  sentryEnvironment: 'dev',
  envBadge: '🟢',
};
