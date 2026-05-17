/**
 * E2E — Creación de libro (#15)
 * Corre contra el backend real.
 * No usa cy.intercept — las peticiones llegan al API real.
 */
describe('Creación de libro (#15)', () => {
  describe('Formulario de creación', () => {
    beforeEach(() => {
      cy.visit('/libros/nuevo');
      cy.get('[data-cy="book-create-form"]', { timeout: 5000 }).should('be.visible');
    });

    it('muestra el título de la sección', () => {
      cy.contains('h1', 'Nuevo libro').should('be.visible');
    });

    it('muestra los 4 campos del formulario', () => {
      cy.get('[data-cy="field-title"]').should('be.visible');
      cy.get('[data-cy="field-author"]').should('be.visible');
      cy.get('[data-cy="field-genre"]').should('be.visible');
      cy.get('[data-cy="field-year"]').should('be.visible');
    });

    it('muestra errores de validación al intentar enviar vacío', () => {
      cy.get('[data-cy="btn-submit"]').click();
      cy.get('[data-cy="error-title"]').should('be.visible').and('contain', 'obligatorio');
      cy.get('[data-cy="error-author"]').should('be.visible').and('contain', 'obligatorio');
    });

    it('el botón cancelar regresa al catálogo sin crear libro', () => {
      cy.get('[data-cy="field-title"]').type('Libro que no se guardará');
      cy.get('[data-cy="btn-cancel"]').click();
      cy.url().should('include', '/catalogo');
    });
  });

  describe('Flujo de creación exitosa', () => {
    const uniqueTitle = `Test E2E Libro ${Date.now()}`;

    it('crea un libro y lo muestra en el catálogo con su código asignado', () => {
      cy.visit('/libros/nuevo');
      cy.get('[data-cy="book-create-form"]', { timeout: 5000 }).should('be.visible');

      cy.get('[data-cy="field-title"]').type(uniqueTitle);
      cy.get('[data-cy="field-author"]').type('Autor de Prueba E2E');
      cy.get('[data-cy="field-genre"]').type('Ficción');
      cy.get('[data-cy="field-year"]').type('2024');

      cy.get('[data-cy="btn-submit"]').click();

      cy.url({ timeout: 10000 }).should('include', '/catalogo');

      cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');
      cy.contains('[data-cy="book-row"]', uniqueTitle).should('be.visible');
      cy.contains('[data-cy="book-row"]', uniqueTitle)
        .find('span.font-code')
        .should('not.be.empty');
    });
  });
});
