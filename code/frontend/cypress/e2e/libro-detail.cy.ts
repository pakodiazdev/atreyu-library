/**
 * E2E — Detalle de libro (#13)
 * Corre contra el backend real (seeder dev/qa).
 * No usa cy.intercept — las peticiones llegan al API real.
 */
describe('Detalle de libro (#13)', () => {
  let firstBookUlid: string;

  before(() => {
    cy.visit('/catalogo');
    cy.get('[data-cy="book-row"]', { timeout: 10000 }).first().click();
    cy.url().then((url) => {
      // URL: /libros/:authorSlug/:bookSlug — guardamos el bookSlug
      firstBookUlid = url.split('/').pop() ?? '';
    });
    cy.go('back');
  });

  describe('Navegación desde el catálogo', () => {
    it('navega al detalle al hacer clic en una fila', () => {
      cy.visit('/catalogo');
      cy.get('[data-cy="book-row"]', { timeout: 10000 }).first().click();
      cy.url().should('match', /\/libros\/[a-z0-9-]+\/[A-Z]\d{2}-[a-z0-9-]+$/);
    });

    it('muestra el botón de volver al catálogo', () => {
      cy.visit('/catalogo');
      cy.get('[data-cy="book-row"]', { timeout: 10000 }).first().click();
      cy.get('[data-cy="back-btn"]').should('be.visible');
    });

    it('el botón de volver regresa a /catalogo', () => {
      cy.visit('/catalogo');
      cy.get('[data-cy="book-row"]', { timeout: 10000 }).first().click();
      cy.get('[data-cy="back-btn"]').click();
      cy.url().should('include', '/catalogo');
    });
  });

  describe('Vista de detalle', () => {
    beforeEach(() => {
      cy.visit('/catalogo');
      cy.get('[data-cy="book-row"]', { timeout: 10000 }).first().click();
      cy.get('[data-cy="book-detail"]', { timeout: 10000 }).should('be.visible');
    });

    it('muestra el título del libro', () => {
      cy.get('[data-cy="book-title"]').should('not.be.empty');
    });

    it('muestra el autor del libro', () => {
      cy.get('[data-cy="book-author"]').should('not.be.empty');
    });

    it('muestra el código del libro', () => {
      cy.get('[data-cy="book-code"]').should('not.be.empty');
    });

    it('muestra el año de publicación', () => {
      cy.get('[data-cy="book-year"]').should('not.be.empty');
    });

    it('muestra la fecha de creación', () => {
      cy.get('[data-cy="book-created-at"]').should('not.be.empty');
    });

    it('muestra la fecha de actualización', () => {
      cy.get('[data-cy="book-updated-at"]').should('not.be.empty');
    });
  });

  describe('Libro conocido del seeder (A01 — Cien años de soledad)', () => {
    it('muestra los datos correctos del libro A01', () => {
      cy.visit('/catalogo');
      cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');
      cy.contains('[data-cy="book-row"]', 'Cien años de soledad').click();

      cy.get('[data-cy="book-title"]').should('contain', 'Cien años de soledad');
      cy.get('[data-cy="book-author"]').should('contain', 'Gabriel García Márquez');
      cy.get('[data-cy="book-code"]').should('contain', 'A01');
    });

    it('muestra la sinopsis del libro A01 al navegar desde el catálogo', () => {
      cy.visit('/catalogo');
      cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');
      cy.contains('[data-cy="book-row"]', 'Cien años de soledad').click();

      cy.get('[data-cy="book-detail"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="book-synopsis"]').should('be.visible').and('not.be.empty');
    });
  });

  describe('Libro no encontrado (404)', () => {
    it('muestra el estado de no encontrado para un código inexistente', () => {
      cy.visit('/libros/autor-desconocido/Z99-libro-inexistente');
      cy.get('[data-cy="not-found-state"]', { timeout: 10000 }).should('be.visible');
      cy.contains('Libro no encontrado').should('be.visible');
    });

    it('el botón en el estado 404 vuelve al catálogo', () => {
      cy.visit('/libros/autor-desconocido/Z99-libro-inexistente');
      cy.get('[data-cy="not-found-state"]', { timeout: 10000 }).should('be.visible');
      cy.contains('Volver al catálogo').click();
      cy.url().should('include', '/catalogo');
    });
  });
});
