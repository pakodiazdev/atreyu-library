# CI/CD — Atreyu Library

> Este documento describe la estrategia de integración y entrega continua del proyecto
> Atreyu Library, los flujos automatizados, las herramientas utilizadas y las reglas
> de protección de ramas.

---

## Herramientas

| Herramienta | Rol |
|-------------|-----|
| GitHub Actions | Orquestación de pipelines CI y CD |
| SonarCloud | Análisis estático de calidad y cobertura |
| Docker | Empaquetado de imágenes para despliegue |
| Google Cloud Run | Plataforma de despliegue |
| Claude Code | Agente de codificación — implementación |
| GitHub Copilot | Agente de codificación + revisión automática de PR |
| Devin | Revisión automática de PR |

---

## Workflow de desarrollo con AI

El desarrollo integra agentes de IA en roles distintos y complementarios,
orquestados por el developer como responsable final de todas las decisiones
técnicas, arquitectura y calidad del producto.

| Rol | Responsable |
|-----|-------------|
| 👨‍💻 Orquestador — decisiones técnicas, arquitectura y dirección | Developer |
| 🤖 Agente de codificación | Claude Code |
| 🤖 Agente de codificación + revisión de PR | GitHub Copilot |
| 🤖 Revisión de PR | Devin |

Los agentes de IA son herramientas bajo dirección del developer — ninguna decisión
técnica o de arquitectura es delegada a un agente sin validación humana. Claude Code
y GitHub Copilot actúan como agentes de codificación durante el desarrollo; Copilot
y Devin actúan como revisores en cada PR antes del merge, complementando la calidad
que garantiza SonarCloud.

---

## Flujo CI — Pull Request

Se ejecuta automáticamente al abrir o actualizar un PR hacia `main`.
El merge queda **bloqueado** si cualquier check falla.

```
PR abierto / actualizado
         │
         ▼
┌────────────────────┐
│   Backend checks   │
│  ├── Checkstyle    │
│  ├── Tests JUnit   │
│  └── Build Maven   │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Frontend checks   │
│  ├── ESLint        │
│  ├── Typecheck     │
│  └── Tests Karma   │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│    SonarCloud      │
│  ├── Cobertura     │
│  ├── Code smells   │
│  └── Duplicación   │
└────────┬───────────┘
         │
    ¿Todo pasa?
    ✅ Sí │ ❌ No → merge bloqueado
         │
         ▼
┌────────────────────┐
│  Review Copilot    │
│  Review Devin      │
└────────┬───────────┘
         │
         ▼
    PR listo para merge
```

---

## Flujo CD — Merge a main

Se ejecuta automáticamente al hacer merge a `main`. El deploy solo ocurre
si el CI gate completo y los tests E2E pasan — lint, tests, SonarCloud y
Cypress corren sobre el código real de `main` antes de cualquier despliegue.

```
Merge a main
      │
      ├────────────────────────────────────────┐
      ▼                                        ▼
┌──────────────────────┐          ┌──────────────────────────┐
│   CI Gate — Backend  │          │   CI Gate — Frontend     │
│  ├── Checkstyle      │          │  ├── ESLint              │
│  ├── Tests JUnit     │          │  ├── Typecheck           │
│  └── SonarCloud      │          │  ├── Tests Vitest        │
└──────────┬───────────┘          │  └── SonarCloud          │
           │ ✅ pasa              └────────────┬─────────────┘
           └──────────────┬───────────────────┘
                          │ ✅ ambos pasan
                          ▼
              ┌───────────────────────┐
              │   E2E Gate — Cypress  │
              │  stack completo E2E   │
              │  (postgres+BE+FE)     │
              └───────────┬───────────┘
                          │ ✅ pasa
              ┌───────────┴───────────┐
              ▼                       ▼
┌──────────────────────┐  ┌──────────────────────────┐
│  Build + Push image  │  │  Build + Push image      │
│  backend:sha         │  │  frontend:sha            │
└──────────┬───────────┘  └────────────┬─────────────┘
           │                           │
           ▼                     (espera migrate-and-seed)
┌──────────────────────────────────────────────┐
│  Migrate + seed BD prod                      │
│  Cloud Run Job — modo no-web (Spring Boot)   │
│  SPRING_PROFILES_ACTIVE=prod-init            │
│  Flyway migrate + seeders → Spring sale solo │
└──────────┬───────────────────────────────────┘
           │
           ├───────────────────────────────────────┐
           ▼                                       ▼
┌──────────────────────┐  ┌──────────────────────────┐
│  Deploy Cloud Run    │  │  Deploy Cloud Run        │
│  atreyu-backend      │  │  atreyu-frontend         │
│  (FLYWAY_ENABLED=    │  │  (prod)                  │
│   false)             │  │                          │
└──────────┬───────────┘  └────────────┬─────────────┘
           │                           │
           └──────────────┬────────────┘
                          ▼
              ┌───────────────────────┐
              │  Cleanup revisiones   │
              │  Cloud Run + imágenes │
              │  Artifact Registry    │
              │  (solo queda la       │
              │   última versión)     │
              └───────────────────────┘
```

> Si el CI gate o el gate E2E falla, **ningún servicio se despliega**. Los tres
> gates (ci-backend, ci-frontend, e2e) deben pasar para que el deploy proceda.
> El job `migrate-and-seed` corre **antes** de desplegar los servicios — las
> migraciones y seeders se ejecutan una sola vez por deploy (no en cada cold start).
> Los servicios arriban con `SPRING_FLYWAY_ENABLED=false`.
> Tras el deploy, el job cleanup elimina todas las revisiones anteriores de ambos
> servicios — solo la revisión activa permanece en Cloud Run.

---

## Flujo QA — Deploy manual por branch

Permite desplegar cualquier branch a un ambiente de pruebas para validar
antes de abrir el PR a `main`. Requiere que todos los checks de CI del
branch seleccionado estén en `success` antes de construir las imágenes.

```
Trigger manual
(branch seleccionado)
        │
        ▼
┌────────────────────────────────────────┐
│  Verificar CI del branch               │
│  Todos los checks deben ser SUCCESS    │
│  (Backend + Frontend + E2E)            │
└──────────────────┬─────────────────────┘
                   │ ✅ pasa
        ┌──────────┴───────────┐
        ▼                      ▼
┌───────────────────┐  ┌───────────────────────┐
│  Build + Push BE  │  │  Build + Push FE      │
│  backend:qa-sha   │  │  frontend:qa-sha      │
└────────┬──────────┘  └──────────┬────────────┘
         │                        │
         ▼                  (espera migrate-and-seed)
┌────────────────────────────────────────────────┐
│  Migrate + seed BD QA                          │
│  Cloud Run Job — modo no-web (Spring Boot)     │
│  SPRING_PROFILES_ACTIVE=qa-init                │
│  Flyway clean + migrate + seeders → sale solo  │
└──────────┬─────────────────────────────────────┘
           │
           ├───────────────────────────────────────┐
           ▼                                       ▼
┌───────────────────────┐  ┌───────────────────────────┐
│  Deploy Cloud Run QA  │  │  Deploy Cloud Run QA      │
│  atreyu-backend-qa    │  │  atreyu-frontend-qa       │
│  (FLYWAY_ENABLED=     │  │  qa01.atreyu-library      │
│   false)              │  │                           │
└──────────┬────────────┘  └────────────┬──────────────┘
           │                            │
           └─────────────┬──────────────┘
                         ▼
             ┌───────────────────────┐
             │  Cleanup revisiones   │
             │  e imágenes QA        │
             │  anteriores           │
             └───────────────────────┘
```

> El job `migrate-and-seed` en QA ejecuta `Flyway clean` antes de migrar —
> el entorno QA siempre parte de datos limpios en cada deploy.

---

## Protección de ramas

| Regla | Configuración |
|-------|--------------|
| Branch protegido | `main` |
| Checks requeridos | Lint BE + FE, Tests BE + FE, SonarCloud |
| Reviews requeridas | Mínimo 1 aprobación |
| Merge sin checks | ❌ Bloqueado |
| Push directo a main | ❌ Bloqueado |
| Historial lineal | ✅ Requerido (squash o rebase) |

> **Nota sobre el flujo de aprobación:** al ser un proyecto unipersonal no es posible
> auto-aprobar PRs. La protección de rama está configurada y activa — demuestra que el
> proceso existe y funciona. En un equipo real la aprobación corresponde a un peer
> reviewer o líder técnico antes del merge.

---

## Workflows de GitHub Actions

```
.github/workflows/
├── ci.yml          → checks en PR (lint + tests + SonarCloud)
├── cd.yml          → deploy automático al mergear a main
└── qa-deploy.yml   → deploy manual por branch a QA
```

---

## Calidad — SonarCloud

| Métrica | Umbral mínimo |
|---------|--------------|
| Cobertura de tests | ≥ 80% en código nuevo |
| Code smells | 0 bloqueantes |
| Duplicación | ≤ 3% |
| Vulnerabilidades | 0 |

Un PR que no supere estos umbrales no puede mergearse.
