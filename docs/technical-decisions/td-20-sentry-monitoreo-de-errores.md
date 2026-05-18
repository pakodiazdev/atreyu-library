# TD-20 — Sentry como plataforma de monitoreo de errores

## Contexto

El sistema necesita captura automática de excepciones en producción y QA sin depender de revisión manual de logs. Las excepciones deben incluir stack trace completo, contexto del request (backend) y diferenciación por ambiente.

## Decisión

Integrar **Sentry** en el backend (Spring Boot) y el frontend (Angular) como plataforma centralizada de monitoreo de errores.

- **Backend**: `sentry-spring-boot-starter-jakarta` con configuración por perfil. El DSN se inyecta vía variable de entorno `SENTRY_DSN_BACKEND` en Cloud Run. En dev y e2e el DSN está vacío, lo que desactiva Sentry automáticamente.
- **Frontend**: `@sentry/angular` inicializado en `main.ts` antes del bootstrap. El DSN se inyecta en build-time como Docker build arg (`SENTRY_DSN_FRONTEND`) y reemplaza un placeholder en los environment files de prod y QA. En dev y e2e el DSN es vacío.
- **Performance monitoring**: deshabilitado (`tracesSampleRate=0`/`sentry.traces-sample-rate=0.0`) para mantener el alcance acotado a captura de errores.

## Alternativas consideradas

| Opción | Razón de descarte |
|--------|-------------------|
| Rollbar | Menor adopción en el ecosistema Spring/Angular; pricing similar |
| Datadog APM | Overkill para un proyecto de demo; costo elevado |
| Solo logs en Cloud Logging | Requiere revisión manual; sin agrupación ni alertas automáticas |

## Configuración inicial (one-time setup)

Pasos para activar Sentry en un fork o deploy nuevo del proyecto.

### 1. Crear proyectos en Sentry

En [sentry.io](https://sentry.io), crear **dos proyectos**:

| Proyecto | Platform | Slug sugerido |
|----------|----------|---------------|
| Backend  | Java — Spring Boot | `backend-atreyu-library` |
| Frontend | JavaScript — Angular | `frontend-atreyu-library` |

Al crear cada proyecto, Sentry genera un **DSN** (URL tipo `https://abc@o123.ingest.sentry.io/456`).

### 2. Agregar GitHub Secrets

En el repositorio → **Settings → Secrets and variables → Actions**, agregar:

| Secret | Valor |
|--------|-------|
| `SENTRY_DSN_BACKEND` | DSN del proyecto Spring Boot |
| `SENTRY_DSN_FRONTEND` | DSN del proyecto Angular |

Estos secrets son consumidos por `cd.yml` (prod) y `qa-deploy.yml` (QA) automáticamente — no se requiere ningún cambio en el código.

### 3. Verificar

Tras el primer deploy con los secrets configurados, lanzar un error de prueba:

- **Backend**: lanzar una excepción no controlada en cualquier endpoint.
- **Frontend**: ejecutar `Sentry.captureException(new Error('test'))` desde la consola del navegador.

El evento debe aparecer en el dashboard de Sentry con el ambiente correcto (`qa` o `prod`).

> Los ambientes `qa` y `prod` comparten los mismos DSNs — Sentry los diferencia
> por el campo `environment` que el SDK envía en cada evento.

---

## Consecuencias

- Los errores de prod y QA aparecen agrupados en el dashboard de Sentry con ambiente diferenciado.
- Los errores de dev nunca se reportan a Sentry.
- El DSN del backend es confidencial (se almacena como GitHub Secret y se pasa como env var en Cloud Run).
- El DSN del frontend se embebe en el bundle JavaScript (es técnicamente público por diseño de Sentry para SDKs de cliente).
