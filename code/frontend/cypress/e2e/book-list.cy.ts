/**
 * E2E — Catálogo (#12)
 * Corre contra el backend real (seeder dev/qa).
 * No usa cy.intercept — las peticiones llegan al API real.
 */
describe('Catálogo — Lista de libros (#12)', () => {
  beforeEach(() => {
    cy.visit('/catalogo');
  });

  it('muestra el título de la sección y libros del seeder', () => {
    cy.contains('h1', 'Catálogo').should('be.visible');
    cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="book-row"]').should('have.length.at.least', 10);
    cy.contains(/\d+ títulos/).should('be.visible');
  });

  it('muestra libros conocidos del seeder en la tabla', () => {
    cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="filter-title"]').type('Cien');
    cy.contains('[data-cy="book-row"]', 'Cien años de soledad', { timeout: 5000 }).should('exist');
    cy.contains('[data-cy="book-row"]', 'Gabriel García Márquez').should('exist');
    cy.get('[data-cy="book-row"]').first().find('[data-cy="book-code"]')
      .invoke('text').invoke('trim').should('match', /^[A-Z]\d{2}$/);
  });

  it('filtra por título y devuelve resultados reales', () => {
    cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');

    cy.get('[data-cy="filter-title"]').type('quijote');
    cy.get('[data-cy="book-row"]', { timeout: 5000 }).should('have.length', 1);
    cy.contains('Don Quijote de la Mancha').should('be.visible');
  });

  it('filtra por autor y devuelve resultados reales', () => {
    cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');

    cy.get('[data-cy="filter-author"]').type('Tolkien');
    cy.get('[data-cy="book-row"]', { timeout: 5000 }).should('have.length', 1);
    cy.contains('El señor de los anillos').should('be.visible');
  });

  it('muestra estado vacío cuando no hay resultados', () => {
    cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');

    cy.get('[data-cy="filter-title"]').type('zzznoresults');
    cy.get('[data-cy="empty-state"]', { timeout: 5000 }).should('be.visible');
    cy.contains('No se encontraron libros').should('be.visible');
  });

  it('limpiar filtros restablece la lista completa', () => {
    cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');

    cy.get('[data-cy="filter-title"]').type('quijote');
    cy.get('[data-cy="book-row"]', { timeout: 5000 }).should('have.length', 1);

    cy.get('[data-cy="clear-filters"]').click();
    cy.get('[data-cy="book-row"]', { timeout: 5000 }).should('have.length.at.least', 10);
  });

  it('muestra badges de género', () => {
    cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');
    cy.get('ui-badge').should('have.length.at.least', 1);
  });

  it('navega al detalle al hacer clic en una fila', () => {
    cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="book-row"]').first().click();
    cy.url().should('match', /\/libros\/[a-z0-9-]+\/[A-Z]\d{2}-[a-z0-9-]+$/);
  });
});
