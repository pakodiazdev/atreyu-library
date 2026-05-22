import { defineConfig } from 'cypress';

// Prioridad de resolución del baseUrl:
// 1. CYPRESS_BASE_URL  — override explícito (útil en CI o casos especiales)
// 2. E2E_FRONTEND_PORT — puerto configurado en .env.e2e, construye la URL automáticamente
// 3. http://localhost:4200 — valor por defecto
const frontendPort = process.env['E2E_FRONTEND_PORT'] ?? '4200';
const baseUrl =
  process.env['CYPRESS_BASE_URL'] ?? `http://localhost:${frontendPort}`;
const envBadge = process.env['ENV_BADGE'] ?? '🟢';

export default defineConfig({
  e2e: {
    baseUrl,
    env: { envBadge },
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    video: false,
  },
});
