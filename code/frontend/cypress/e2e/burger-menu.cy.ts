/**
 * E2E — Mobile burger menu (#32)
 * Verifica el comportamiento del menú hamburguesa en viewport móvil.
 */
describe('Mobile burger menu (#32)', () => {
  beforeEach(() => {
    cy.viewport('iphone-6');
    cy.visit('/catalogo');
  });

  it('muestra el botón hamburguesa en móvil', () => {
    cy.get('[data-cy="burger-menu"]').should('be.visible');
  });

  it('el sidebar está oculto por defecto en móvil', () => {
    cy.get('[data-cy="sidebar-drawer"]').should('not.be.visible');
  });

  it('abre el sidebar al hacer clic en el botón hamburguesa', () => {
    cy.get('[data-cy="burger-menu"]').click();
    cy.get('[data-cy="sidebar-drawer"]').should('be.visible');
  });

  it('cierra el sidebar al hacer clic en el backdrop', () => {
    cy.get('[data-cy="burger-menu"]').click();
    cy.get('[data-cy="sidebar-drawer"]').should('be.visible');
    cy.get('[data-cy="sidebar-backdrop"]').click();
    cy.get('[data-cy="sidebar-drawer"]').should('not.be.visible');
  });

  it('cierra el sidebar al presionar Escape', () => {
    cy.get('[data-cy="burger-menu"]').click();
    cy.get('[data-cy="sidebar-drawer"]').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('[data-cy="sidebar-drawer"]').should('not.be.visible');
  });

  it('cierra el sidebar al hacer clic en un enlace de navegación', () => {
    cy.get('[data-cy="burger-menu"]').click();
    cy.get('[data-cy="sidebar-drawer"]').should('be.visible');
    cy.get('[data-cy="sidebar-drawer"] a').first().click();
    cy.get('[data-cy="sidebar-drawer"]').should('not.be.visible');
  });

  context('en viewport md+ (desktop)', () => {
    beforeEach(() => {
      cy.viewport(1024, 768);
    });

    it('no muestra el botón hamburguesa en desktop', () => {
      cy.get('[data-cy="burger-menu"]').should('not.be.visible');
    });

    it('el sidebar es siempre visible en desktop', () => {
      cy.get('[data-cy="sidebar-drawer"]').should('be.visible');
    });
  });
});
