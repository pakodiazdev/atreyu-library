/**
 * E2E — Detalle de libro en drawer (#44)
 * Corre contra el backend real (seeder dev/qa).
 * No usa cy.intercept — las peticiones llegan al API real.
 */
describe('Detalle de libro en drawer (#44)', () => {
  describe('Navegación desde el catálogo', () => {
    it('abre el drawer al hacer clic en una fila', () => {
      cy.visit('/catalogo');
      cy.get('[data-cy="book-row"]', { timeout: 10000 }).first().click();
      cy.get('[data-cy="drawer"]').should('be.visible');
    });

    it('la URL cambia a /libros/:authorSlug/:bookSlug al abrir el drawer', () => {
      cy.visit('/catalogo');
      cy.get('[data-cy="book-row"]', { timeout: 10000 }).first().click();
      cy.url().should('match', /\/libros\/[a-z0-9-]+\/[A-Z]\d{2}-[a-z0-9-]+$/);
    });

    it('la tabla del catálogo sigue visible con el drawer abierto', () => {
      cy.visit('/catalogo');
      cy.get('[data-cy="book-row"]', { timeout: 10000 }).first().click();
      cy.get('[data-cy="drawer"]').should('be.visible');
      cy.get('[data-cy="books-table"]').should('exist');
    });
  });

  describe('Cierre del drawer', () => {
    beforeEach(() => {
      cy.visit('/catalogo');
      cy.get('[data-cy="book-row"]', { timeout: 10000 }).first().click();
      cy.get('[data-cy="drawer"]', { timeout: 10000 }).should('be.visible');
    });

    it('cierra el drawer con el botón ✕ y actualiza la URL a /catalogo', () => {
      cy.get('[data-cy="drawer-close-btn"]').click();
      cy.url().should('include', '/catalogo');
      cy.get('[data-cy="drawer"]').should('not.exist');
    });

    it('cierra el drawer al hacer clic en el backdrop y actualiza la URL a /catalogo', () => {
      cy.get('[data-cy="drawer-backdrop"]').click({ force: true });
      cy.url().should('include', '/catalogo');
    });

    it('cierra el drawer con la tecla Escape y actualiza la URL a /catalogo', () => {
      cy.get('body').type('{esc}');
      cy.url().should('include', '/catalogo');
    });
  });

  describe('Sin reload al cerrar', () => {
    it('la tabla sigue visible tras cerrar — sin reload del componente', () => {
      cy.visit('/catalogo');
      cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="filter-title"]').type('Cien');
      cy.get('[data-cy="book-row"]', { timeout: 5000 }).first().click();
      cy.get('[data-cy="drawer"]', { timeout: 5000 }).should('be.visible');
      cy.get('[data-cy="drawer-close-btn"]').click();
      cy.get('[data-cy="drawer"]').should('not.exist');
      cy.get('[data-cy="filter-title"]').should('have.value', 'Cien');
    });
  });

  describe('Visitar URL de detalle directamente (F5)', () => {
    it('muestra el catálogo con el drawer abierto al acceder directo', () => {
      cy.visit('/catalogo');
      cy.contains('[data-cy="book-row"]', 'Cien años de soledad', { timeout: 10000 }).click();
      cy.url().then((bookUrl) => {
        cy.visit(bookUrl);
        cy.get('[data-cy="drawer"]', { timeout: 10000 }).should('be.visible');
        cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('exist');
      });
    });

    it('el drawer muestra el detalle correcto del libro', () => {
      cy.visit('/catalogo');
      cy.contains('[data-cy="book-row"]', 'Cien años de soledad', { timeout: 10000 }).click();
      cy.url().then((bookUrl) => {
        cy.visit(bookUrl);
        cy.get('[data-cy="book-detail"]', { timeout: 10000 }).should('be.visible');
        cy.get('[data-cy="book-title"]').should('contain', 'Cien años de soledad');
        cy.get('[data-cy="book-author"]').should('contain', 'Gabriel García Márquez');
        cy.get('[data-cy="book-detail"]').find('[data-cy="book-code"]')
          .invoke('text').invoke('trim').should('match', /^[A-Z]\d{2}$/);
      });
    });
  });

  describe('Contenido del drawer', () => {
    beforeEach(() => {
      cy.visit('/catalogo');
      cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');
      cy.contains('[data-cy="book-row"]', 'Cien años de soledad').click();
      cy.get('[data-cy="book-detail"]', { timeout: 10000 }).should('be.visible');
    });

    it('muestra el título del libro', () => {
      cy.get('[data-cy="book-title"]').should('contain', 'Cien años de soledad');
    });

    it('muestra el autor del libro', () => {
      cy.get('[data-cy="book-author"]').should('contain', 'Gabriel García Márquez');
    });

    it('muestra el código del libro en formato correcto', () => {
      cy.get('[data-cy="book-detail"]').find('[data-cy="book-code"]')
        .invoke('text').invoke('trim').should('match', /^[A-Z]\d{2}$/);
    });

    it('muestra la sinopsis del libro', () => {
      cy.get('[data-cy="book-synopsis"]').should('be.visible').and('not.be.empty');
    });
  });

  describe('Libro no encontrado (404)', () => {
    it('muestra el estado no encontrado dentro del drawer', () => {
      cy.visit('/libros/autor-desconocido/Z99-libro-inexistente');
      cy.get('[data-cy="not-found-state"]', { timeout: 10000 }).should('be.visible');
      cy.contains('Libro no encontrado').should('be.visible');
    });

    it('el botón volver en 404 cierra el drawer y navega al catálogo', () => {
      cy.visit('/libros/autor-desconocido/Z99-libro-inexistente');
      cy.get('[data-cy="not-found-state"]', { timeout: 10000 }).should('be.visible');
      cy.contains('Volver al catálogo').click();
      cy.url().should('include', '/catalogo');
    });
  });
});
