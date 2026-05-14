# TD-09 · Estrategia de CD: deploy automático a prod, manual a QA

## Decisión

El pipeline de entrega continua opera con dos flujos diferenciados:

- **Producción** (`cd.yml`): deploy automático en cada merge a `main`
- **QA** (`qa-deploy.yml`): deploy manual vía `workflow_dispatch`, seleccionando el branch a promover

## Justificación

La asimetría es intencional y refleja el riesgo diferente de cada ambiente:

**Producción automática** — main ya pasó CI completo (lint + tests + SonarCloud) y review de PR.
Un merge a main representa código validado en múltiples capas; no hay razón para añadir un paso
manual que solo introduce fricción sin agregar seguridad real.

**QA manual** — QA es un ambiente de validación funcional donde se prueban branches antes de mergear.
El deploy manual permite elegir exactamente qué branch se promueve a QA en cualquier momento, sin
que un push accidental o un branch en progreso sobreescriba una validación en curso.

| Ambiente | Trigger | Razón |
|----------|---------|-------|
| Producción | Push a `main` (automático) | Código ya validado por CI + PR review |
| QA | `workflow_dispatch` (manual) | Control explícito de qué se valida y cuándo |

## Alternativa descartada

Un flujo simétrico (ambos manuales o ambos automáticos) fue descartado:
- **Ambos automáticos**: QA se sobrescribiría con cada push a cualquier branch, imposibilitando
  validaciones de larga duración
- **Ambos manuales**: prod requeriría un paso manual después de un merge ya aprobado — proceso
  sin valor añadido que ralentiza la entrega
