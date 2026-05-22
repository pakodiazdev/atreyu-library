describe('Smoke test', () => {
  it('carga la aplicación y muestra el título correcto', () => {
    const badge: string = Cypress.env('envBadge') ?? '';
    const expectedTitle = badge ? `${badge} Atreyu Library` : 'Atreyu Library';
    cy.visit('/');
    cy.title().should('eq', expectedTitle);
    cy.get('app-root').should('exist');
  });
});
