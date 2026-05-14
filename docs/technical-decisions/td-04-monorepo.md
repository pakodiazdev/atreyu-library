# TD-04 · Monorepo

## Decisión

Frontend y backend conviven en un **único repositorio** (`atreyu-library/`), organizados
bajo `code/backend/` y `code/frontend/`. La configuración de Docker se centraliza en `docker/`.

## Justificación

- Simplifica la revisión técnica — el evaluador clona un solo repo y tiene el proyecto completo
- CI/CD más limpio: un solo lugar de configuración
- Cambios que afectan ambas capas quedan en el mismo PR y el mismo historial
- La carpeta `docker/` centraliza todos los Dockerfiles y configuraciones de nginx,
  separando la infraestructura del código de la aplicación
- Para el alcance de este proyecto no existe ventaja real en separar los repositorios
