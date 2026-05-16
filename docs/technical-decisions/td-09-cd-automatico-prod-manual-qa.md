# TD-09 · Estrategia de CD: deploy automático a prod, manual a QA

## Decisión

El pipeline de entrega continua opera con dos flujos diferenciados:

- **Producción** (`cd.yml`): CI completo (lint + tests + SonarCloud) seguido de deploy automático en cada merge a `main`
- **QA** (`qa-deploy.yml`): deploy manual vía `workflow_dispatch`, seleccionando el branch a promover

## Justificación

La asimetría es intencional y refleja el riesgo diferente de cada ambiente:

**Producción automática con CI gate global** — `cd.yml` ejecuta lint, tests y SonarCloud sobre el código
real de `main` para ambos servicios antes de cualquier deploy. Si el CI gate de cualquier servicio falla,
**ningún servicio se despliega** — ni el que falló ni el que pasó. Esto evita desfases entre frontend y
backend en producción (e.g. un frontend nuevo llamando APIs de un backend que no llegó por fallo de tests).

El deploy es automático porque un merge a `main` ya viene validado por: CI en PR + review de PR + CI gate en CD.
No hay razón para añadir un paso manual que solo introduce fricción sin agregar seguridad real.

**QA manual** — QA es un ambiente de validación funcional donde se prueban branches antes de mergear.
El deploy manual permite elegir exactamente qué branch se promueve a QA en cualquier momento, sin
que un push accidental o un branch en progreso sobreescriba una validación en curso.

| Ambiente | Trigger | CI gate | Razón |
|----------|---------|---------|-------|
| Producción | Push a `main` (automático) | ✅ lint + tests + SonarCloud (ambos servicios) | Deploy bloqueado si cualquier CI falla — evita desfases frontend/backend |
| QA | `workflow_dispatch` (manual) | ❌ solo build y deploy | Control explícito de qué se valida y cuándo |

## Alternativa descartada

Un flujo simétrico (ambos manuales o ambos automáticos) fue descartado:
- **Ambos automáticos**: QA se sobrescribiría con cada push a cualquier branch, imposibilitando
  validaciones de larga duración
- **Ambos manuales**: prod requeriría un paso manual después de un merge ya aprobado — proceso
  sin valor añadido que ralentiza la entrega
