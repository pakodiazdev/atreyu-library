import './commands';

/**
 * Intercepta el health check del splash screen en todos los tests E2E.
 * El backend ya está levantado antes de que Cypress corra (ver CI), así que
 * interceptar aquí no cambia la fidelidad de los tests de negocio — solo evita
 * que un cold start accidental ralentice o rompa specs que prueban otras cosas.
 */
beforeEach(() => {
  cy.intercept('GET', '**/api/v1/health', { statusCode: 200, body: { status: 'UP' } }).as('healthCheck');
});
