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

## Consecuencias

- Los errores de prod y QA aparecen agrupados en el dashboard de Sentry con ambiente diferenciado.
- Los errores de dev nunca se reportan a Sentry.
- El DSN del backend es confidencial (se almacena como GitHub Secret y se pasa como env var en Cloud Run).
- El DSN del frontend se embebe en el bundle JavaScript (es técnicamente público por diseño de Sentry para SDKs de cliente).
