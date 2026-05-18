// Proxy config para el entorno E2E.
// - Local (host): E2E_BACKEND_HOST=localhost,    E2E_BACKEND_PORT=8081 (o el valor en .env.e2e)
// - Docker:       E2E_BACKEND_HOST=backend_e2e,  E2E_BACKEND_PORT=8081 (SERVER_PORT del backend)
// Los valores vienen de .env.e2e (local) o del environment del contenedor (Docker/CI).
const backendHost = process.env['E2E_BACKEND_HOST'] || 'localhost';
const backendPort = process.env['E2E_BACKEND_PORT'] || '8081';

module.exports = {
  '/api': {
    target: `http://${backendHost}:${backendPort}`,
    changeOrigin: true,
    // Tomcat 10 rechaza hostnames con guiones bajos (p. ej. backend_e2e).
    // Se sobreescribe la cabecera Host con un valor válido para que pase la validación.
    headers: { host: `localhost:${backendPort}` },
    logLevel: 'info',
  },
};
