// Proxy config para el entorno de desarrollo.
// - Dentro del contenedor: BACKEND_HOST=localhost, BACKEND_PORT=8080 (siempre el puerto interno)
// - Local (fuera de Docker): ajusta BACKEND_HOST/BACKEND_PORT según el mapeo de tu .env
const backendHost = process.env['BACKEND_HOST'] || 'localhost';
const backendPort = process.env['BACKEND_PORT'] || '8080';

module.exports = {
  '/api': {
    target: `http://${backendHost}:${backendPort}`,
    changeOrigin: true,
    logLevel: 'info',
  },
};
