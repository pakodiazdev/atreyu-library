/**
 * E2E — Edición de libro en drawer (#14)
 * Corre contra el backend real.
 * No usa cy.intercept — las peticiones llegan al API real.
 *
 * La edición se accede desde el botón "Editar libro" en el panel de detalle.
 * El formulario reutiliza app-book-form con una transición deslizante entre paneles.
 */
describe('Edición de libro en drawer (#14)', () => {
  function openBookDetail() {
    cy.visit('/catalogo');
    cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');
    cy.contains('[data-cy="book-row"]', 'Cien años de soledad').click();
    cy.get('[data-cy="book-detail"]', { timeout: 10000 }).should('be.visible');
  }

  function openEditForm() {
    openBookDetail();
    cy.get('[data-cy="book-edit-btn"]').scrollIntoView().click();
    cy.get('[data-cy="book-edit-form"]', { timeout: 5000 }).should('be.visible');
  }

  // ── Apertura del formulario ───────────────────────────────────────────────

  describe('Apertura del formulario de edición', () => {
    it('el botón "Editar libro" está visible en el panel de detalle', () => {
      openBookDetail();
      cy.get('[data-cy="book-edit-btn"]').scrollIntoView().should('be.visible');
    });

    it('clic en "Editar libro" muestra el formulario de edición en el mismo drawer', () => {
      openBookDetail();
      cy.get('[data-cy="book-edit-btn"]').scrollIntoView().click();
      cy.get('[data-cy="book-edit-form"]', { timeout: 5000 }).should('be.visible');
    });

    it('el drawer cambia su título a "Editar libro"', () => {
      openBookDetail();
      cy.get('[data-cy="book-edit-btn"]').scrollIntoView().click();
      cy.get('[data-cy="drawer"]').contains('Editar libro').should('be.visible');
    });

    it('el formulario aparece pre-llenado con el título del libro', () => {
      openEditForm();
      cy.get('[data-cy="field-title"]').should('have.value', 'Cien años de soledad');
    });

    it('el formulario aparece pre-llenado con el autor del libro', () => {
      openEditForm();
      cy.get('[data-cy="field-author"]').should('have.value', 'Gabriel García Márquez');
    });
  });

  // ── Cancelar edición ──────────────────────────────────────────────────────

  describe('Cancelar edición', () => {
    beforeEach(() => openEditForm());

    it('el botón Cancelar regresa al panel de detalle (transición inversa)', () => {
      cy.get('[data-cy="btn-cancel"]').click();
      cy.get('[data-cy="book-detail"]', { timeout: 5000 }).should('be.visible');
    });

    it('el drawer permanece abierto al cancelar', () => {
      cy.get('[data-cy="btn-cancel"]').click();
      cy.get('[data-cy="drawer"]').should('be.visible');
    });

    it('el detalle vuelve a mostrar el título original', () => {
      cy.get('[data-cy="btn-cancel"]').click();
      cy.get('[data-cy="book-title"]', { timeout: 5000 })
        .should('contain', 'Cien años de soledad');
    });
  });

  // ── Validación ────────────────────────────────────────────────────────────

  describe('Validación del formulario de edición', () => {
    beforeEach(() => openEditForm());

    it('muestra errores de validación cuando los campos requeridos se borran', () => {
      cy.get('[data-cy="field-title"]').clear();
      cy.get('[data-cy="field-author"]').clear();
      cy.get('[data-cy="btn-submit"]').click();
      cy.get('[data-cy="error-title"]').should('be.visible').and('contain', 'obligatorio');
      cy.get('[data-cy="error-author"]').should('be.visible').and('contain', 'obligatorio');
    });

    it('no cierra el drawer cuando el formulario es inválido', () => {
      cy.get('[data-cy="field-title"]').clear();
      cy.get('[data-cy="btn-submit"]').click();
      cy.get('[data-cy="book-edit-form"]').should('be.visible');
    });
  });

  // ── Flujo de edición exitosa ──────────────────────────────────────────────

  describe('Flujo de edición exitosa', () => {
    const base         = Date.now();
    const titleOrig    = `Test E2E Edit ${base}`;
    const titleUpdated = `Test E2E Edit Updated ${base}`;

    it('edita el título de un libro y el detalle muestra el valor actualizado', () => {
      // 1. Crear libro de prueba para no modificar datos del seeder
      cy.visit('/catalogo');
      cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');
      cy.contains('button', '+ Añadir libro').click();
      cy.get('[data-cy="book-create-form"]', { timeout: 5000 }).should('be.visible');
      cy.get('[data-cy="field-title"]').type(titleOrig);
      cy.get('[data-cy="field-author"]').type('Autor Editable E2E');
      cy.get('[data-cy="btn-submit"]').click();
      cy.get('[data-cy="drawer"]', { timeout: 10000 }).should('not.exist');

      // 2. Abrir el libro recién creado
      cy.get('[data-cy="books-table"]', { timeout: 10000 }).should('be.visible');
      cy.contains('[data-cy="book-row"]', titleOrig).scrollIntoView().click();
      cy.get('[data-cy="book-detail"]', { timeout: 10000 }).should('be.visible');

      // 3. Editar el título
      cy.get('[data-cy="book-edit-btn"]').scrollIntoView().click();
      cy.get('[data-cy="book-edit-form"]', { timeout: 5000 }).should('be.visible');
      cy.get('[data-cy="field-title"]').clear().type(titleUpdated);
      cy.get('[data-cy="btn-submit"]').click();

      // 4. El drawer vuelve al detalle con el título actualizado
      cy.get('[data-cy="book-detail"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="book-title"]').should('contain', titleUpdated);
    });
  });
});
