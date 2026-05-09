# Convenciones de Git

> Este documento define las convenciones para el manejo de ramas, commits y Pull Requests
> en el proyecto Atreyu Library, garantizando trazabilidad, consistencia y un historial
> de cambios legible.

---

## Ramas

### Formato

```
<tipo>/<número-issue>-<descripción-corta>
```

### Tipos

| Tipo | Propósito | Ejemplo |
|------|-----------|---------|
| `feature/` | Nueva funcionalidad | `feature/005-get-books-endpoint` |
| `fix/` | Corrección de bug | `fix/012-book-code-generation` |
| `docs/` | Documentación | `docs/001-architecture-document` |
| `chore/` | Configuración, mantenimiento | `chore/003-docker-compose-setup` |
| `ci/` | CI/CD, workflows | `ci/004-github-actions-pr-workflow` |
| `test/` | Tests | `test/008-book-service-unit-tests` |

### Reglas

1. Siempre en minúsculas
2. Kebab-case (palabras separadas por `-`)
3. Número de issue zero-padded a 3 dígitos (`003`, no `3`)
4. Descripción: 2-5 palabras en inglés
5. Sin caracteres especiales

### ✅ Correctas

```
feature/005-get-books-endpoint
docs/001-architecture-document
ci/004-pr-workflow-sonarcloud
fix/012-book-code-generation
```

### ❌ Incorrectas

```
libros                         # Sin tipo ni issue
Feature/5-ListarLibros         # Mayúsculas, sin padding
feature/lista_libros           # Underscores, sin issue
```

---

## Commits

### Formato

```
:emoji [#NNN] - descripción corta :emoji

- :emoji Actividad 1
- :emoji Actividad 2
```

### Emojis por tipo

| Emoji | Tipo | Cuándo usarlo |
|-------|------|---------------|
| ✨ | feat | Nueva funcionalidad |
| 🐛 | fix | Corrección de bug |
| 📚 | docs | Documentación |
| 🎨 | style | Formato, sin cambio lógico |
| 🔨 | refactor | Reestructura sin cambio de comportamiento |
| 🚀 | perf | Mejora de rendimiento |
| ✅ | test | Tests |
| 🔧 | chore | Configuración, mantenimiento |

### Reglas

- Todo commit debe estar vinculado a un issue `[#NNN]`
- El número de issue va zero-padded a 3 dígitos
- El guión (` - `) entre issue y descripción es obligatorio
- Cada bullet del body debe iniciar con un emoji
- El emoji ornamental al final del subject es obligatorio
- Si no existe el issue, créalo antes de hacer el commit

### ✅ Correcto

```
✨ [#005] - Implement GET /books endpoint 📚

- 🌐 Created BooksController with list and detail endpoints
- 🔍 Added search filters by title, author and genre
- 📝 Configured Swagger annotations
- ✅ Added unit tests for BookService
```

### ❌ Incorrecto

```
✨ [#005] Implement GET /books             ← falta el guión
- Created BooksController                  ← bullet sin emoji
feat: implement books list                 ← sin issue, sin emoji
```

---

## Pull Requests

### Título

```
:emoji [#NNN] - Descripción corta
```

**Ejemplos:**

```
✨ [#005] - GET /books endpoint with search filters
🐛 [#012] - Fix book code generation algorithm
📚 [#001] - Add architecture and technical decisions docs
⚙️ [#004] - Configure CI/CD pipeline with SonarCloud
```

### Descripción

```markdown
## 📋 Resumen

Descripción breve de lo que incluye este PR (1-3 oraciones).

---

## 🚀 Commits

1. **abc1234** ✨ Commit message 1
2. **def5678** 🔧 Commit message 2

---

## ✅ Qué incluye

### Backend

- Endpoints o cambios en la API

### Frontend

- Componentes o cambios en la UI

---

## ⚠️ Breaking Changes (si aplica)

- Descripción del cambio que rompe compatibilidad

---

## 🧪 Testing

- [ ] Tests unitarios pasando
- [ ] Tests de integración pasando
- [ ] Testing manual completado
- [ ] Review de Copilot sin observaciones críticas
- [ ] Review de Devin sin observaciones críticas

---

## 🔗 Referencias

- **Issue**: #NNN

---

## 📝 Pendiente (opcional)

- [ ] Trabajo futuro intencionalmente fuera de scope
```

---

## Mapeo tipo de rama → emoji de commit

| Rama | Emoji principal |
|------|----------------|
| `feature/` | ✨ |
| `fix/` | 🐛 |
| `docs/` | 📚 |
| `chore/` | 🔧 |
| `ci/` | ⚙️ |
| `test/` | ✅ |
