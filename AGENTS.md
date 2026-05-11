# AGENTS.md

Este archivo provee contexto y reglas obligatorias para agentes de IA (Claude, Copilot, Devin, etc.)
que trabajen en este repositorio.

---

## Descripción del proyecto

Atreyu Library es una plataforma cloud-native para la gestión de bibliotecas. Es una prueba técnica
diseñada para demostrar arquitectura, CI/CD, calidad, escalabilidad y documentación. No es un CRUD
simple — cada decisión técnica debe estar justificada.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular (signals, services — sin NgRx) |
| Backend | Spring Boot |
| Base de datos | PostgreSQL |
| Infraestructura | Docker + Docker Compose |
| Cloud | Google Cloud Run |
| CI/CD | GitHub Actions + SonarCloud |
| API Docs | Swagger / OpenAPI |

---

## Estructura del monorepo

```
atreyu-library/
├── code/
│   ├── backend/              # Spring Boot API
│   └── frontend/             # Angular app
├── docker/
│   ├── dev_container/        # Imagen de desarrollo (JDK 17 + Node 22)
│   │   ├── Dockerfile
│   │   └── start.sh          # Arranca BE + FE en paralelo
│   ├── backend/
│   │   └── Dockerfile        # Multi-stage para producción/QA
│   └── frontend/
│       ├── Dockerfile        # Multi-stage (build + nginx) para producción/QA
│       └── nginx.conf        # Config nginx (subcarpetas solo si hay configs por entorno)
├── .devcontainer/
│   └── devcontainer.json     # VS Code abre directo en dev_container
├── docs/                     # Documentación del proyecto
├── docker-compose.yml        # Entorno de desarrollo local
└── .github/
    └── workflows/            # GitHub Actions (CI/CD)
```

### Entornos Docker

| Entorno | Composición | Comando |
|---------|-------------|---------|
| **Desarrollo** | `dev_container` (BE+FE) + `postgres` | `docker compose up` |
| **QA / Producción** | Imágenes independientes BE + FE + `postgres` | Gestionado por CI/CD |

El `dev_container` monta el código del host vía volumen — los cambios en `code/` se reflejan sin reconstruir la imagen.

### Múltiples entornos en paralelo

Cada entorno (desarrollador, agente de IA, CI) debe tener su propio `.env` con valores únicos para evitar conflictos de nombres y puertos:

```bash
# .env del entorno 1
COMPOSE_PROJECT_NAME=atreyu-dev
BACKEND_PORT=8080
FRONTEND_PORT=4200
POSTGRES_FW_PORT=5432   # puerto del host (el interno siempre es 5432, hardcodeado en la JDBC URL)

# .env del entorno 2 (agente, otro dev, CI)
COMPOSE_PROJECT_NAME=atreyu-agent1
BACKEND_PORT=8181
FRONTEND_PORT=4201
POSTGRES_FW_PORT=5433   # puerto diferente en el host para evitar conflictos
```

`COMPOSE_PROJECT_NAME` prefija todos los contenedores, redes y volúmenes — `docker ps` los distingue claramente. Los puertos deben ser únicos por entorno para evitar conflictos en el host.

---

## Arquitectura backend

Seguir estrictamente esta estructura por capas:

```
Controller → Service → Repository → Entity
                ↕
              DTO
```

- **Controller**: recibe request, delega al Service, retorna response
- **Service**: lógica de negocio, usa Repository
- **Repository**: acceso a datos (Spring Data JPA)
- **Entity**: modelo JPA mapeado a tabla PostgreSQL
- **DTO**: objetos de transferencia para request/response (nunca exponer la Entity directamente)

### Migraciones de base de datos (Flyway — obligatorio)

`ddl-auto` está fijado en `none`. **Nunca usar `create`, `update` o `create-drop` en desarrollo ni producción.**

> **Excepción — scope de test**: `src/test/resources/application.properties` usa `ddl-auto=create-drop`
> con H2 en memoria y Flyway deshabilitado, únicamente para que el context load test (`contextLoads`)
> corra sin PostgreSQL externo. Esta excepción es válida solo en ese archivo; en cualquier otro
> contexto la regla aplica sin excepciones. La migración a Testcontainers (PostgreSQL real en tests)
> está prevista en Issue #004.

Todos los cambios al esquema deben hacerse mediante migraciones de Flyway:

```
code/backend/src/main/resources/db/migration/
├── V1__baseline.sql           # Punto de partida — esquema vacío
├── V2__create_books_table.sql # Una migración por entidad o cambio de esquema
└── V{n}__{descripcion}.sql
```

Reglas de migraciones:

- El número `V{n}` es secuencial e irrepetible — nunca reutilizar ni reordenar
- La descripción usa `snake_case` y describe la intención (`create_books_table`, no `books`)
- Una migración aplicada **nunca se edita** — correcciones van en una nueva migración `V{n+1}`
- Cada nueva entidad requiere su propia migración (`V{n}__create_{entity}_table.sql`)
- Los cambios de columna también requieren migración (`V{n}__add_{column}_to_{table}.sql`)

---

## Arquitectura frontend

```
Component → Service → HTTP Client → API
               ↕
            Signals (estado local/cache)
```

- **Services**: toda la lógica de comunicación con la API
- **Signals**: manejo de estado reactivo (sin NgRx)
- **Cache**: invalidar después de mutations, similar a TanStack Query

### Stack de UI

| Capa | Tecnología |
|------|-----------|
| Estilos | Tailwind CSS |
| Componentes base | spartan/ui (headless, viven en `shared/ui/`) |

### Filosofía de componentes (obligatorio)

**Atomizar para reutilizar** — todo elemento visual que pueda aparecer en más de un lugar debe
ser un componente standalone reutilizable. No duplicar HTML/clases en templates de features.

Jerarquía de componentes:

```
shared/ui/          ← Átomos y moléculas: Button, Badge, Card, Dialog, Input, Table…
shared/layout/      ← Organismos de layout: AppLayoutComponent, AppSidebarComponent, AppHeaderComponent
features/<name>/    ← Componentes de negocio que consumen los anteriores
```

**Regla**: si un componente usa los mismos estilos o estructura en dos lugares distintos → extraer a `shared/`.

### Documentación de componentes (obligatorio)

**Todo componente creado o modificado en `shared/` debe tener su archivo de documentación en:**

```
docs/frontend/components/<component-name>.md
```

Cada archivo sigue esta estructura:

```markdown
# NombreComponent

Descripción de una línea: qué hace y en qué contexto se usa.

## Uso básico

\`\`\`html
<app-nombre [input]="valor" (output)="handler($event)" />
\`\`\`

## Inputs

| Nombre | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `prop` | `string` | `''` | Descripción |

## Outputs

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `evento` | `EventEmitter<T>` | Descripción |

## Variantes

Lista de variantes o estados visuales disponibles con ejemplo de uso.

## Notas

Restricciones, dependencias o comportamientos no evidentes.
```

**Reglas:**
- El archivo lleva el mismo nombre en `kebab-case` que el componente Angular
- Si el componente no tiene inputs/outputs, omitir esa sección
- El ejemplo de uso debe ser copiable y funcionar sin modificaciones
- El agente es responsable de crear/actualizar el `.md` en el mismo commit que el componente

---

## Modelo principal

```
Book
├── id           (ULID — identificador técnico interno, usado en operaciones DELETE/PUT)
├── code         (A-Z + 00-99, generado aleatoriamente — identificador visible en UI)
├── title
├── author
├── genre
├── publicationYear
├── createdAt
└── updatedAt
```

**Regla importante:** el `code` NO es la PK. El ULID es la PK real. El `code` se muestra en UI
pero las operaciones internas (PUT, DELETE) usan el ULID.

---

## Idiomas

| Contexto | Idioma |
|----------|--------|
| Código fuente | Inglés |
| Nombres de variables, métodos, clases | Inglés |
| URLs y endpoints | Inglés |
| Commits y branches | Inglés |
| Documentación (`docs/`) | Español |
| Comentarios en código | Español |
| UI | Español |

**Nunca mezclar idiomas en el mismo artefacto.**

> **Nota para revisores automáticos (Copilot, etc.):** Los comentarios en código van en
> **español** — el revisor del proyecto es hispanohablante y así se reducen fricciones de
> lenguaje. Solo los elementos de programación (variables, clases, funciones, etc.) van en inglés.

---

## Pre-commit (obligatorio — ejecutar siempre antes de commitear)

**Nunca commitear con errores de lint. Corregir primero, commitear después.**

```bash
# Backend — Checkstyle + compilación
cd backend && ./mvnw checkstyle:check

# Frontend — ESLint + TypeScript check
cd frontend && npm run lint && npm run typecheck
```

Si los linters hacen auto-fix, incluir los archivos corregidos en el mismo commit.

---

## Mensajes de commit (obligatorio — seguir al pie de la letra)

Referencia completa: `docs/conventions/git.md`

### Por qué este formato

- **Número de issue `[#NNN]`**: todo commit debe estar vinculado a un issue de GitHub. El issue
  es donde vive el contexto completo: por qué se hizo el cambio, qué problema resuelve, qué
  decisión se tomó. Sin él, el historial pierde trazabilidad permanentemente. Si no existe el
  issue, créalo antes de commitear.
- **Emojis en lugar de palabras**: `✨` reemplaza `feat`, `🐛` reemplaza `fix`, `🔧` reemplaza
  `chore`. Un carácter carga el mismo peso semántico que una palabra completa, hace el log
  escaneable de un vistazo y la categoría es visible sin leer. Cada emoji tiene un significado
  fijo — no son decoración, son la etiqueta de categoría.

### Formato — todos los campos son obligatorios

```
:emoji [#NNN] - descripción corta :emoji

- :emoji Actividad 1
- :emoji Actividad 2
- :emoji Actividad 3
```

### Reglas (violaciones no se deben repetir)

- Todo commit DEBE estar vinculado a un issue `[#NNN]` — sin issue, no hay commit
- Subject line: `emoji [#NNN] - descripción emoji` — el guión (` - `) es obligatorio
- Cada bullet del body DEBE iniciar con un emoji — `- texto` sin emoji no está permitido
- El número de issue siempre zero-padded a 3 dígitos: `#001`, `#030`, no `#1` o `#30`
- La descripción es concisa (modo imperativo), nunca termina en punto
- El emoji ornamental al final del subject es obligatorio

### Tipos de emoji

| Emoji | Tipo | Uso |
|-------|------|-----|
| ✨ | feat | Nueva funcionalidad |
| 🐛 | fix | Corrección de bug |
| 📚 | docs | Documentación |
| 🎨 | style | Formato, sin cambio lógico |
| 🔨 | refactor | Reestructura sin cambio de comportamiento |
| 🚀 | perf | Mejora de rendimiento |
| ✅ | test | Tests |
| 🔧 | chore | Configuración, mantenimiento |

### ✅ Correcto

```
✨ [#005] - Implement GET /books endpoint 📚

- 🌐 Created BooksController with list and search endpoints
- 🔍 Added filters by title, author and genre
- 📝 Configured Swagger annotations
- ✅ Added unit tests for BookService
```

### ❌ Incorrecto

```
✨ [#005] Implement GET /books             ← falta el guión
- Created BooksController                  ← bullet sin emoji
feat: implement books list                 ← sin issue, sin emoji
🔧 fix linter                              ← sin issue
```

---

## API conventions

- Endpoints en plural: `/books`, no `/book`
- Respuestas en camelCase JSON
- Versionar si aplica: `/api/v1/books`
- Swagger documentado en todos los endpoints

---

## Testing

- **Backend**: JUnit 5 + Mockito para unit tests, Spring Boot Test para integración
- **Frontend**: Jasmine/Karma para unit tests
- SonarCloud es un check requerido en CI — los PRs no se pueden mergear si falla

---

## Registro de tiempo en issues (obligatorio)

El agente es responsable de ayudar a mantener el registro de sesiones en cada issue activo.
Este registro permite conocer de forma objetiva cuánto tiempo se invirtió en cada tarea.

### Al iniciar trabajo en un issue

Cuando el developer indique que va a trabajar en un issue, el agente debe:

1. Identificar el issue activo
2. Agregar automáticamente una nueva entrada al array de sesiones con `start` = hora actual
   y `end` vacío:

```json
{ "date": "YYYY-MM-DD", "start": "HH:MM", "end": "" }
```

3. Recordarle al developer que debe indicar cuándo termina la sesión.

### Al cerrar una sesión

Cuando el developer indique que termina de trabajar (frases como "termino", "fin de sesión",
"cerramos", "hasta aquí", "nos vemos"), el agente debe:

1. Registrar el `end` = hora actual en la sesión abierta
2. Actualizar el campo `Real` de Estimación sumando todas las sesiones del issue
3. Confirmar el registro al developer

### Formato de sesión

```json
[
  { "date": "2026-05-08", "start": "20:00", "end": "21:30" },
  { "date": "2026-05-09", "start": "08:00", "end": "11:00" }
]
```

### Reglas

- Nunca dejar una sesión con `end` vacío al cerrar el issue
- El campo `Real` se expresa en horas y minutos: `3h 30m`
- Si el developer olvida indicar el fin de sesión, el agente debe preguntarlo
  al retomar el trabajo en el mismo issue

---

## Flujo de trabajo

1. Crear issue en GitHub antes de empezar cualquier tarea
2. Crear rama desde `main` siguiendo la convención de `docs/conventions/git.md`
3. Desarrollar, correr linters antes de cada commit
4. Abrir PR siguiendo el template de `docs/conventions/git.md`
5. Esperar review de Copilot y Devin
6. Mergear a `main` — el CD despliega automáticamente a Cloud Run
