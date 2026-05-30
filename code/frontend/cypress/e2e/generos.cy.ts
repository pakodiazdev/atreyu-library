/**
 * E2E — Géneros: estantería visual (#101)
 * Corre contra el backend real (seeder dev/qa).
 * No usa cy.intercept — las peticiones llegan al API real.
 */
describe('Géneros — Estantería visual (#101)', () => {

  // ── Helpers ────────────────────────────────────────────────────────────────

  function visitGeneros() {
    cy.visit('/generos');
    cy.get('[data-cy="genre-chip-bar"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="genre-shelf"]', { timeout: 10000 }).should('have.length.at.least', 1);
  }

  function createBookWithGenre(title: string, genre: string) {
    cy.visit('/catalogo');
    cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');
    cy.contains('button', '+ Añadir libro').click();
    cy.get('[data-cy="book-create-form"]', { timeout: 5000 }).should('be.visible');
    cy.get('[data-cy="field-title"]').type(title);
    cy.get('[data-cy="field-author"]').type('Autor E2E Géneros');
    cy.get('[data-cy="field-genre"]').type(genre);
    cy.get('[data-cy="btn-submit"]').click();
    cy.get('[data-cy="drawer"]', { timeout: 10000 }).should('not.exist');
  }

  // ── Vista inicial ───────────────────────────────────────────────────────────

  describe('Vista inicial', () => {
    beforeEach(() => {
      visitGeneros();
    });

    it('muestra el título Géneros', () => {
      cy.get('[data-cy="generos-title"]').should('contain', 'Géneros');
    });

    it('muestra chips de géneros del seeder', () => {
      cy.get('[data-cy="genre-chip"]').should('have.length.at.least', 5);
      cy.get('[data-cy="genre-chip"][data-genre="Fantasía"]').should('be.visible');
    });

    it('cada chip muestra el nombre y el conteo de libros', () => {
      cy.get('[data-cy="genre-chip"][data-genre="Fantasía"]')
        .should('contain', 'Fantasía')
        .and('contain.text', '1');
    });

    it('muestra al menos una estantería con lomos de libro', () => {
      cy.get('[data-cy="genre-shelf"]').should('have.length.at.least', 1);
      cy.get('[data-cy="book-spine"]').should('have.length.at.least', 1);
    });

    it('cada estantería muestra el nombre del género y el conteo', () => {
      cy.get('[data-cy="genre-shelf"]').first().within(() => {
        cy.get('[data-cy="genre-shelf-title"]').should('not.be.empty');
        cy.get('[data-cy="genre-shelf-count"]').invoke('text').should('match', /\d+ libros/);
      });
    });
  });

  // ── Filtrado por chip ───────────────────────────────────────────────────────

  describe('Filtrado por género', () => {
    beforeEach(() => {
      visitGeneros();
    });

    it('al seleccionar un chip solo muestra la estantería de ese género', () => {
      cy.get('[data-cy="genre-chip"][data-genre="Fantasía"]').click();
      cy.get('[data-cy="genre-shelf"]', { timeout: 5000 }).should('have.length', 1);
      cy.get('[data-cy="genre-shelf"][data-genre="Fantasía"]').should('exist');
    });

    it('la URL se actualiza con el género seleccionado', () => {
      cy.get('[data-cy="genre-chip"][data-genre="Fantasía"]').click();
      cy.url().should('include', '/generos/Fantas');
    });

    it('el chip seleccionado aparece con estado activo', () => {
      cy.get('[data-cy="genre-chip"][data-genre="Fantasía"]').click();
      cy.get('[data-cy="genre-chip"][data-genre="Fantasía"]')
        .should('have.class', 'bg-tinta');
    });

    it('al seleccionar dos chips muestra exactamente dos estanterías', () => {
      cy.get('[data-cy="genre-chip"][data-genre="Fantasía"]').click();
      cy.get('[data-cy="genre-chip"][data-genre="Terror"]').click();
      cy.get('[data-cy="genre-shelf"]', { timeout: 5000 }).should('have.length', 2);
    });

    it('al deseleccionar el chip activo vuelven todas las estanterías', () => {
      cy.get('[data-cy="genre-chip"][data-genre="Fantasía"]').click();
      cy.get('[data-cy="genre-shelf"]', { timeout: 5000 }).should('have.length', 1);

      cy.get('[data-cy="genre-chip"][data-genre="Fantasía"]').click();
      cy.get('[data-cy="genre-shelf"]', { timeout: 5000 }).should('have.length.at.least', 5);
    });
  });

  // ── Navegación directa por URL ──────────────────────────────────────────────

  describe('Navegación directa por URL', () => {
    it('visitar /generos/Fantasía muestra solo la estantería de Fantasía', () => {
      cy.visit('/generos/Fantas%C3%ADa');
      cy.get('[data-cy="genre-shelf"]', { timeout: 10000 }).should('have.length', 1);
      cy.get('[data-cy="genre-shelf"][data-genre="Fantasía"]').should('exist');
    });

    it('el chip de Fantasía aparece activo al navegar directamente', () => {
      cy.visit('/generos/Fantas%C3%ADa');
      cy.get('[data-cy="genre-chip"][data-genre="Fantasía"]', { timeout: 10000 })
        .should('have.class', 'bg-tinta');
    });
  });

  // ── Interacción con lomos ───────────────────────────────────────────────────

  describe('Clic en lomo de libro', () => {
    beforeEach(() => {
      cy.visit('/generos/Fantas%C3%ADa');
      cy.get('[data-cy="book-spine"]', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('al hacer clic en un lomo abre el drawer de detalle', () => {
      cy.get('[data-cy="book-spine"]').first().click();
      cy.get('[data-cy="book-detail"]', { timeout: 10000 }).should('be.visible');
    });

    it('el drawer muestra el nombre y autor del libro', () => {
      cy.get('[data-cy="book-spine"]').first().click();
      cy.get('[data-cy="book-detail"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="drawer"]').find('h2,h3').first().invoke('text').should('not.be.empty');
    });

    it('cerrar el drawer mantiene la URL en géneros', () => {
      cy.get('[data-cy="book-spine"]').first().click();
      cy.get('[data-cy="drawer-close-btn"]', { timeout: 5000 }).click();
      cy.get('[data-cy="drawer"]').should('not.exist');
      cy.url().should('include', '/generos');
    });
  });

  // ── Eliminar libro desde géneros ────────────────────────────────────────────

  describe('Eliminar libro desde géneros', () => {
    it('el libro eliminado desaparece de la estantería y la página permanece en géneros', () => {
      const title = `E2E Géneros Delete ${Date.now()}`;
      createBookWithGenre(title, 'Fantasía');

      cy.visit('/generos/Fantas%C3%ADa');
      cy.get('[data-cy="genre-shelf"][data-genre="Fantasía"]', { timeout: 10000 }).should('exist');

      cy.get('[data-cy="book-spine"]')
        .filter(`[title*="${title}"]`)
        .should('exist')
        .click();

      cy.get('[data-cy="book-detail"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="book-delete-btn"]').click();
      cy.get('[data-cy="dialog"]', { timeout: 5000 }).should('be.visible');

      cy.get('[data-cy="expected-code"]')
        .invoke('text')
        .invoke('trim')
        .then((bookCode) => {
          cy.get('[data-cy="field-confirm-code"]').type(bookCode);
          cy.get('[data-cy="btn-confirm-delete"]').click();
        });

      cy.get('[data-cy="dialog"]', { timeout: 10000 }).should('not.exist');
      cy.get('[data-cy="drawer"]', { timeout: 5000 }).should('not.exist');
      cy.url().should('include', '/generos');
      cy.get('[data-cy="book-spine"]')
        .filter(`[title*="${title}"]`)
        .should('not.exist');
    });
  });

});
