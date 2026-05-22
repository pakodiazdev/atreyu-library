describe('Smoke test', () => {
  it('carga la aplicación y muestra el título correcto', () => {
    cy.visit('/');
    cy.title().should('eq', '🔵 Atreyu Library');
    cy.get('app-root').should('exist');
  });
});
