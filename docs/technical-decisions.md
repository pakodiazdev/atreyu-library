# Decisiones Técnicas — Atreyu Library

> Este documento es el índice de todas las decisiones técnicas del proyecto.
> Cada decisión tiene su propio archivo en [`docs/technical-decisions/`](technical-decisions/).
> El objetivo es dar contexto a futuros revisores o colaboradores sobre el razonamiento
> detrás de cada elección.

---

| ID | Decisión | Área |
|----|----------|------|
| [TD-01](technical-decisions/td-01-ulid-como-llave-primaria.md) | ULID como llave primaria, código de negocio como identificador secundario *(revisado por TD-17)* | Base de datos |
| [TD-02](technical-decisions/td-02-despliegue-google-cloud-run.md) | Google Cloud Run como plataforma de despliegue | Infraestructura |
| [TD-03](technical-decisions/td-03-postgresql-supabase.md) | PostgreSQL como motor de base de datos — Supabase como proveedor del demo | Base de datos |
| [TD-04](technical-decisions/td-04-monorepo.md) | Monorepo | Arquitectura |
| [TD-05](technical-decisions/td-05-prioridad-lectura-primero.md) | Prioridad de desarrollo: Lectura → Actualización → Creación → Eliminación | Proceso |
| [TD-06](technical-decisions/td-06-flyway-gestion-de-esquema.md) | Flyway para gestión del esquema de base de datos | Base de datos |
| [TD-07](technical-decisions/td-07-pgadmin-base-datos-local.md) | pgAdmin para gestión local de base de datos | Herramientas |
| [TD-08](technical-decisions/td-08-claude-design-prototipado.md) | Claude Design como herramienta de prototipado | Frontend |
| [TD-09](technical-decisions/td-09-cd-automatico-prod-manual-qa.md) | Estrategia de CD: deploy automático a prod, manual a QA | CI/CD |
| [TD-10](technical-decisions/td-10-cloud-run-acceso-publico.md) | Acceso público a los servicios de Cloud Run (`--allow-unauthenticated`) | Infraestructura |
| [TD-11](technical-decisions/td-11-seeder-solo-dev-qa.md) | Seeder activo solo en `dev` y `qa`, excluido de `prod` | Backend |
| [TD-12](technical-decisions/td-12-artifact-registry-sobre-docker-hub.md) | Artifact Registry sobre Docker Hub como registro de imágenes | Infraestructura |
| [TD-13](technical-decisions/td-13-env-vars-sobre-secret-manager.md) | Credenciales de base de datos vía `env_vars` en lugar de GCP Secret Manager | Seguridad |
| [TD-14](technical-decisions/td-14-tailwind-y-spartan-ui.md) | Tailwind CSS + spartan/ui como stack de UI para Angular | Frontend |
| [TD-15](technical-decisions/td-15-servicios-separados-en-cloud-run.md) | Servicios de frontend y backend separados en Cloud Run | Infraestructura |
| [TD-16](technical-decisions/td-16-noindex-en-todas-las-superficies.md) | Ninguna superficie del proyecto se expone a indexación por buscadores | Seguridad |
| [TD-17](technical-decisions/td-17-bigserial-pk-ulid-identificador-externo.md) | BIGSERIAL como PK interna + ULID como identificador externo de la API | Base de datos |
