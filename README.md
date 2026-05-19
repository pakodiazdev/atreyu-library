# Atreyu Library

> **Prueba técnica para el rol de Analista Senior — Flecha Amarilla / Conecta GFA.**
> Plataforma cloud-native para la gestión de bibliotecas, desarrollada con Angular,
> Spring Boot y PostgreSQL. Enfocada en escalabilidad, automatización CI/CD y buenas
> prácticas de arquitectura de software.

![CI](https://github.com/pakodiazdev/atreyu-library/actions/workflows/ci.yml/badge.svg)
![CD](https://github.com/pakodiazdev/atreyu-library/actions/workflows/cd.yml/badge.svg)

**Backend (Spring Boot)** &nbsp;
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=atreyu-library-backend&metric=alert_status)](https://sonarcloud.io/project/overview?id=atreyu-library-backend)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=atreyu-library-backend&metric=coverage)](https://sonarcloud.io/project/overview?id=atreyu-library-backend)

**Frontend (Angular)** &nbsp;
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=atreyu-library-frontend&metric=alert_status)](https://sonarcloud.io/project/overview?id=atreyu-library-frontend)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=atreyu-library-frontend&metric=coverage)](https://sonarcloud.io/project/overview?id=atreyu-library-frontend)

---

## Ambientes

| Ambiente | URL | Acceso |
|----------|-----|--------|
| Producción | [atreyu-library.pakodiaz.dev](https://atreyu-library.pakodiaz.dev) | Público |
| QA | [qa01.atreyu-library.pakodiaz.dev](https://qa01.atreyu-library.pakodiaz.dev) | Usuario: `qa` / Contraseña: `preview` ¹ |
| **API Docs — Prod (Swagger)** | [api.atreyu-library.pakodiaz.dev/swagger-ui.html](https://api.atreyu-library.pakodiaz.dev/swagger-ui.html) | Público |
| **API Docs — QA (Swagger)** | [api-qa01.atreyu-library.pakodiaz.dev/swagger-ui.html](https://api-qa01.atreyu-library.pakodiaz.dev/swagger-ui.html) | Público |

> ¹ **Nota para el revisor del demo:** las credenciales se publican intencionalmente para
> facilitar la verificación del requisito RNF-15. En un proyecto real se gestionarían a
> través de un gestor de secretos (p. ej. 1Password, HashiCorp Vault) y nunca se incluirían
> en el repositorio. El propósito de la autenticación básica en QA es ilustrar que el
> ambiente de pre-producción puede restringirse a personas autorizadas antes de que los
> cambios lleguen a producción.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular + Signals |
| Backend | Spring Boot |
| Base de datos | PostgreSQL (Supabase) |
| Infraestructura | Docker + Docker Compose |
| Cloud | Google Cloud Run |
| CI/CD | GitHub Actions + SonarCloud |
| API Docs | Swagger / OpenAPI |
| Pruebas E2E | Cypress |

---

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [Requerimientos](docs/requirements.md) | Requerimientos funcionales y no funcionales |
| [Arquitectura](docs/architecture.md) | Arquitectura de solución y componentes |
| [Decisiones técnicas](docs/technical-decisions.md) | Resumen de las 21 decisiones de diseño — detalle en [`docs/technical-decisions/`](docs/technical-decisions/) |
| [Alcance del MVP](docs/mvp-scope.md) | Qué está dentro y fuera del alcance |
| [CI/CD](docs/ci-cd.md) | Estrategia de integración y entrega continua |
| [Despliegue](docs/deployment-strategy.md) | Estrategia y configuración de ambientes |
| [Escalabilidad](docs/scalability.md) | Estrategia de crecimiento y proyección |
| [Costos](docs/cost-estimation.md) | Estimación de costos por escenario |
| [Estrategia de testing](docs/testing-strategy.md) | Qué se testea, en qué capa y por qué |
| [Pruebas E2E](docs/testing-e2e.md) | Configuración y ejecución de pruebas con Cypress |
| [Convenciones Git](docs/conventions/git.md) | Branches, commits y Pull Requests |
| [API — Componentes (E/S)](docs/api-components.md) | Contrato de endpoints, request y response |
| [Prototipado](docs/prototyping/wireframes.html) | Wireframes interactivos de la UI |
| [Convenciones de tareas](docs/conventions/tasks.md) | Template y estructura de issues |

---

## Desarrollo local

### Requisitos previos

- Docker y Docker Compose
- Cypress (instalado localmente para pruebas E2E)
- Node.js (para comandos de frontend fuera del contenedor)

### Configuración

1. Clonar el repositorio:

```bash
git clone https://github.com/pakodiazdev/atreyu-library.git
cd atreyu-library
```

2. Crear el archivo de variables de entorno:

```bash
cp .env.example .env
```

3. Levantar el ambiente local:

```bash
docker compose up
```

### Puertos por defecto

| Servicio | Puerto |
|----------|--------|
| Frontend (Angular dev server) | `4200` |
| Backend (Spring Boot) | `8080` |
| PostgreSQL | `5432` |
| pgAdmin 4 | `5050` |

Los puertos son configurables desde `.env` para permitir múltiples instancias
simultáneas en el mismo equipo.

### API Docs

Con el ambiente local levantado:

| Herramienta | URL local |
|-------------|-----------|
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| pgAdmin 4 | `http://localhost:5050` |

---

## Estructura del repositorio

```
atreyu-library/
├── code/
│   ├── backend/              # Spring Boot API
│   └── frontend/             # Angular app
├── docker/                   # Configuración centralizada de Docker
│   ├── backend/
│   │   └── Dockerfile
│   └── frontend/
│       ├── Dockerfile
│       └── nginx.conf
├── docs/                     # Documentación del proyecto
│   ├── conventions/          # Convenciones de Git y tareas
│   ├── diagrams/             # Diagramas UML de secuencia
│   ├── technical-decisions/  # 21 decisiones técnicas individuales (TD-01 … TD-21)
│   ├── prototyping/          # Wireframes interactivos
│   ├── api-components.md
│   ├── architecture.md
│   ├── ci-cd.md
│   ├── cost-estimation.md
│   ├── deployment-strategy.md
│   ├── mvp-scope.md
│   ├── requirements.md
│   ├── scalability.md
│   ├── technical-decisions.md
│   ├── testing-e2e.md
│   └── testing-strategy.md
├── .github/
│   ├── workflows/            # GitHub Actions (CI, CD, QA deploy)
│   └── ISSUE_TEMPLATE/       # Template de issues
├── .env.example
├── docker-compose.yml
├── AGENTS.md                 # Guía para agentes de IA
└── README.md
```

---

## Backlog y progreso

El backlog priorizado y el estado del proyecto están disponibles en el
[GitHub Projects board](https://github.com/users/pakodiazdev/projects/10).

| Sprint | Entregable |
|--------|-----------|
| Sprint 0 | Documentación completa |
| Sprint 1 | Infraestructura + CI/CD + template en producción |
| Sprint 2 | Lectura de libros |
| Sprint 3 | Actualización de libros |
| Sprint 4 | Creación de libros |
| Sprint 5 | Eliminación de libros |
| Sprint 6 | Pulido post-MVP |
