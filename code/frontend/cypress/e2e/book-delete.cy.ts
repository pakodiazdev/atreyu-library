/**
 * E2E — Eliminación de libro (#16)
 * Corre contra el backend real.
 * No usa cy.intercept — las peticiones llegan al API real.
 *
 * Cada test crea su propio libro con título único para no depender
 * del seeder y no interferir con otros tests.
 */
describe('Eliminación de libro (#16)', () => {
  function createBook(title: string) {
    cy.visit('/catalogo');
    cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');
    cy.contains('button', '+ Añadir libro').click();
    cy.get('[data-cy="book-create-form"]', { timeout: 5000 }).should('be.visible');
    cy.get('[data-cy="field-title"]').type(title);
    cy.get('[data-cy="field-author"]').type('Autor E2E Delete');
    cy.get('[data-cy="btn-submit"]').click();
    cy.get('[data-cy="drawer"]', { timeout: 10000 }).should('not.exist');
    cy.contains('[data-cy="book-row"]', title, { timeout: 10000 }).scrollIntoView().should('be.visible');
  }

  function openDetailForBook(title: string) {
    cy.contains('[data-cy="book-row"]', title).click();
    cy.get('[data-cy="book-detail"]', { timeout: 10000 }).should('be.visible');
  }

  function openDeleteDialog() {
    cy.get('[data-cy="book-delete-btn"]').click();
    cy.get('[data-cy="dialog"]', { timeout: 5000 }).should('be.visible');
    cy.contains('Eliminar libro').should('be.visible');
  }

  // ── Dialog: apertura y cierre ────────────────────────────────────────────────

  describe('Dialog de confirmación', () => {
    let testTitle: string;

    beforeEach(() => {
      testTitle = `E2E Delete ${Date.now()}`;
      createBook(testTitle);
      openDetailForBook(testTitle);
    });

    it('el botón eliminar abre el dialog de confirmación', () => {
      openDeleteDialog();
      cy.get('[data-cy="dialog-panel"]').should('be.visible');
    });

    it('el dialog muestra el código del libro como referencia', () => {
      openDeleteDialog();
      cy.get('[data-cy="expected-code"]').invoke('text').invoke('trim').should('match', /^[A-Z]\d+$/);
    });

    it('el botón cancelar cierra el dialog sin eliminar el libro', () => {
      openDeleteDialog();
      cy.get('[data-cy="dialog-panel"]').find('[data-cy="btn-cancel"]').click();
      cy.get('[data-cy="dialog"]').should('not.exist');
      cy.get('[data-cy="drawer"]').should('be.visible');
      cy.get('[data-cy="book-detail"]').should('be.visible');
    });

    it('cerrar con el botón ✕ del dialog no elimina el libro', () => {
      openDeleteDialog();
      cy.get('[data-cy="dialog-close-btn"]').click();
      cy.get('[data-cy="dialog"]').should('not.exist');
      cy.get('[data-cy="book-detail"]').should('be.visible');
    });
  });

  // ── Validación de código incorrecto ──────────────────────────────────────────

  describe('Validación de código', () => {
    beforeEach(() => {
      const testTitle = `E2E Delete ${Date.now()}`;
      createBook(testTitle);
      openDetailForBook(testTitle);
      openDeleteDialog();
    });

    it('muestra error al confirmar con un código incorrecto', () => {
      cy.get('[data-cy="field-confirm-code"]').type('WRONG');
      cy.get('[data-cy="btn-confirm-delete"]').click();
      cy.get('[data-cy="error-confirm-code"]').should('be.visible');
    });

    it('no cierra el dialog cuando el código es incorrecto', () => {
      cy.get('[data-cy="field-confirm-code"]').type('ZZZZ');
      cy.get('[data-cy="btn-confirm-delete"]').click();
      cy.get('[data-cy="dialog"]').should('be.visible');
    });
  });

  // ── Happy path de eliminación ────────────────────────────────────────────────

  describe('Flujo de eliminación exitosa', () => {
    it('elimina el libro al confirmar con el código correcto y vuelve al catálogo', () => {
      const title = `E2E Delete OK ${Date.now()}`;
      createBook(title);
      openDetailForBook(title);
      openDeleteDialog();

      cy.get('[data-cy="expected-code"]')
        .invoke('text')
        .invoke('trim')
        .then((bookCode) => {
          cy.get('[data-cy="field-confirm-code"]').type(bookCode);
          cy.get('[data-cy="btn-confirm-delete"]').click();
        });

      cy.get('[data-cy="dialog"]', { timeout: 10000 }).should('not.exist');
      cy.get('[data-cy="drawer"]', { timeout: 5000 }).should('not.exist');
      cy.url().should('include', '/catalogo');
    });

    it('el libro eliminado ya no aparece en la tabla del catálogo', () => {
      const title = `E2E Delete Gone ${Date.now()}`;
      createBook(title);
      openDetailForBook(title);
      openDeleteDialog();

      cy.get('[data-cy="expected-code"]')
        .invoke('text')
        .invoke('trim')
        .then((bookCode) => {
          cy.get('[data-cy="field-confirm-code"]').type(bookCode);
          cy.get('[data-cy="btn-confirm-delete"]').click();
        });

      cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');
      cy.contains('[data-cy="book-row"]', title).should('not.exist');
    });
  });
});
