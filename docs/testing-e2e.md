# Pruebas E2E — Atreyu Library

> Este documento describe cómo configurar y ejecutar las pruebas End-to-End
> con Cypress en entorno local, y cómo se integran en el pipeline de CI.
>
> 📐 Para entender **qué** se testea en E2E vs unitarios vs integración,
> consulta [docs/testing-strategy.md](testing-strategy.md).

---

## Stack E2E

| Herramienta | Rol |
|---|---|
| Cypress | Framework E2E — corre en el host |
| Docker Compose (`docker-compose.e2e.yml`) | Stack aislado: Postgres + backend + frontend |
| Spring Boot perfil `e2e` | Backend con CORS abierto y SQL visible |
| `node:22-alpine` | Imagen del frontend E2E (`ng serve --configuration=e2e`) |

> El developer **no necesita Node en el host** — todo el stack corre en Docker.
> Solo se requiere Docker y Cypress instalados localmente.

---

## Configuración inicial (una sola vez)

### 1. Copia el archivo de entorno

```bash
cp .env.e2e.example .env.e2e
```

El archivo `.env.e2e` es **gitignoreado** — nunca se commitea.
Ajusta los puertos si tienes conflictos con otros servicios locales:

```dotenv
E2E_FRONTEND_PORT=4200   # puerto expuesto del frontend E2E
E2E_BACKEND_PORT=8081    # puerto expuesto del backend E2E (default: 8081)
E2E_POSTGRES_PORT=5433   # puerto expuesto de Postgres E2E (default: 5433)
E2E_DB_NAME=atreyu_e2e
E2E_DB_USER=atreyu_e2e
E2E_DB_PASSWORD=atreyu_e2e
CYPRESS_BASE_URL=http://localhost:4200
```

> Si cambias algún puerto, Docker Compose lo toma automáticamente desde `.env.e2e`.
> El proxy interno del frontend apunta a `backend_e2e:${E2E_BACKEND_PORT}` por red Docker —
> el mismo valor que configura `SERVER_PORT` en Spring Boot.

---

## Ejecutar los tests localmente

El stack E2E completo corre en Docker — postgres, backend y frontend.
Solo necesitas **una terminal** para levantar todo y **otra** para Cypress.

### Terminal 1 — Levantar el stack E2E completo

```bash
# Desde code/frontend/
npm run e2e:up
```

Levanta en Docker:
- **Postgres E2E** — efímero, sin volumen, esquema limpio en cada sesión
- **Backend E2E** — Spring Boot perfil `e2e`, Flyway corre migraciones al arrancar
- **Frontend E2E** — `ng serve --configuration=e2e` con proxy hacia el backend por red interna

Espera hasta que `localhost:4200` responda (puede tardar ~1 min la primera vez por `npm ci`).

> La base de datos **no persiste entre sesiones** — cada `e2e:down` + `e2e:up`
> arranca con esquema limpio.

### Terminal 2 — Cypress

Elige el modo según tu necesidad:

#### Modo headless (rápido, igual que CI)

```bash
npm run cy:run:e2e
```

Ejecuta todos los specs en segundo plano y muestra el resultado en consola.
Ideal para validación rápida antes de un commit.

#### Modo headed (browser visible)

```bash
npm run cy:run:headed
```

Abre un browser real y ejecuta los tests de forma visible.
El browser se queda abierto al finalizar (`--no-exit`) para inspeccionar el estado.
Útil para debuggear un test que falla.

#### Modo interactivo (GUI de Cypress)

```bash
npm run cy:open:e2e
```

Abre la GUI de Cypress para seleccionar y correr specs individualmente.
Ideal para **desarrollar** tests nuevos — recarga automáticamente al guardar.

---

## Apagar el entorno

```bash
npm run e2e:down
```

Destruye contenedores, red y volumen de `node_modules`. La DB queda completamente
limpia para la siguiente sesión.

---

## Estructura de archivos

```
code/frontend/
├── cypress/
│   ├── e2e/
│   │   └── smoke.cy.ts          ← smoke test inicial
│   └── support/
│       ├── e2e.ts               ← punto de entrada del support
│       └── commands.ts          ← comandos custom (cy.resetDb(), etc.)
├── cypress.config.ts            ← configuración de Cypress
└── proxy.e2e.conf.js            ← proxy ng serve → backend E2E

docker-compose.e2e.yml           ← stack E2E aislado (postgres + backend + frontend)
.env.e2e.example                 ← plantilla de configuración (en repo)
.env.e2e                         ← configuración local (gitignoreado)
```

> El proxy (`proxy.e2e.conf.js`) usa `E2E_BACKEND_HOST=backend_e2e` dentro de Docker
> (red interna), y `E2E_BACKEND_HOST=localhost` si se corre fuera de Docker.

---

## Agregar nuevos specs

Crea archivos `.cy.ts` en `cypress/e2e/`:

```
cypress/e2e/
├── smoke.cy.ts          ← carga de la app (siempre debe pasar)
├── catalogo.cy.ts       ← flujos del catálogo de libros
└── buscar.cy.ts         ← flujos de búsqueda
```

Cypress los detecta automáticamente — no requiere configuración adicional.

### Convención de comandos custom

Agrega comandos reutilizables en `cypress/support/commands.ts`:

```typescript
// Ejemplo futuro: resetear la DB antes de cada suite
Cypress.Commands.add('resetDb', () => {
  cy.request('POST', '/api/test/reset');
});
```

---

## Integración con CI (GitHub Actions)

Los tests E2E corren automáticamente en cada PR contra `main` y en push a ramas
de trabajo, **después** de que pasen los checks de backend y frontend.

El job `e2e` en `.github/workflows/ci.yml` levanta el mismo stack Docker en el runner:

```
GitHub Actions runner
├── docker compose e2e  →  postgres + backend + frontend (localhost:4200)
└── Cypress headless    →  localhost:4200
```

- Bloquea el merge si algún spec falla
- Cleanup con `if: always()` — el stack se destruye aunque Cypress falle
- Sin dependencias externas — 100% autosuficiente en el runner

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `localhost:4200` no responde | Stack E2E no levantado | Ejecutar `npm run e2e:up` y esperar ~1 min |
| Frontend arranca pero `/api` falla | Backend no saludable | `docker compose logs backend_e2e` |
| Puerto `8081`, `5433` o `4200` ocupado | Conflicto con dev u otro proceso | Cambiar el puerto en `.env.e2e` |
| Tests fallan en CI pero pasan local | Diferencia en datos o timing | Revisar logs del runner en GitHub Actions |
| DB con datos de sesión anterior | `e2e:down` no se ejecutó | Correr `e2e:down` y luego `e2e:up` |
| `npm ci` muy lento al levantar | Primera vez sin volumen cacheado | Esperar — las siguientes veces usa el volumen `frontend_e2e_node_modules` |
