# Alcance del MVP — Atreyu Library

> Este documento delimita el alcance del proyecto para la prueba técnica de Flecha Amarilla /
> Conecta GFA. Define qué está comprometido en cada entrega, qué queda explícitamente fuera,
> y sirve como referencia de trazabilidad entre los requerimientos, los sprints y los
> entregables evaluables.

---

## Entregables requeridos

La prueba técnica exige los siguientes entregables. Todos están cubiertos por este proyecto:

| # | Entregable | Documento / Artefacto | Sprint |
|---|------------|-----------------------|--------|
| 1 | Repositorio Git público con historial de commits | [github.com/pakodiazdev/atreyu-library](https://github.com/pakodiazdev/atreyu-library) | 0 |
| 2 | Documentación de arquitectura de solución | [docs/architecture.md](architecture.md) | 0 |
| 3 | Documento de decisiones técnicas | [docs/technical-decisions.md](technical-decisions.md) | 0 |
| 4 | Documentación de componentes (entradas/salidas de API) | [docs/api-components.md](api-components.md) | 0 |
| 5 | Diagramas UML de secuencia para cada operación CRUD | [docs/diagrams/sequence-diagrams.md](diagrams/sequence-diagrams.md) | 0 |
| 6 | Prototipo / wireframes de la interfaz | [docs/prototyping/wireframes.html](prototyping/wireframes.html) | 0 |
| 7 | Estimación de costos de infraestructura cloud | [docs/cost-estimation.md](cost-estimation.md) | 0 |
| 8 | Pipeline CI/CD automatizado | GitHub Actions (`.github/workflows/`) | 1 |
| 9 | Aplicación desplegada en cloud (prod + QA) | [atreyu-library.pakodiaz.dev](https://atreyu-library.pakodiaz.dev) | 1 |
| 10 | API documentada con Swagger / OpenAPI | `/swagger-ui.html` (backend desplegado) | 1 |

---

## Funcionalidades comprometidas

El MVP cubre las 4 operaciones CRUD sobre la entidad `Book`, entregadas progresivamente
a lo largo de los sprints:

| Sprint | Funcionalidad | RF cubiertos |
|--------|---------------|--------------|
| Sprint 0 | Documentación completa | — |
| Sprint 1 | Infraestructura + CI/CD + template en producción | RNF-01 a RNF-06, RNF-15, RNF-16 |
| Sprint 2 | Listar y buscar libros · Ver detalle de un libro | RF-01, RF-02, RF-03 |
| Sprint 3 | Editar libro existente | RF-06 |
| Sprint 4 | Registrar nuevo libro · Generación de código de negocio | RF-04, RF-05 |
| Sprint 5 | Eliminar libro | RF-07 |

Cada sprint produce un despliegue funcional a producción. Al finalizar Sprint 5,
el sistema es completamente operativo.

---

## Fuera del alcance

Las siguientes funcionalidades están explícitamente excluidas del MVP. No forman parte
de los requerimientos del ejercicio y su inclusión generaría scope creep sin valor
evaluable adicional.

### Autenticación y autorización

El MVP no implementa login, roles ni control de acceso. La biblioteca es de acceso abierto.

**Extensión futura:** la arquitectura por capas (Controller → Service → Repository) permite
incorporar **Spring Security + JWT** de forma transversal sin cambios estructurales.

---

### Seguridad de aplicación

El MVP no implementa controles de seguridad avanzados. El alcance de la prueba técnica
no los exige, y su implementación consumiría tiempo que compromete los entregables
funcionales.

Lo que **sí está cubierto** por el stack elegido:

| Control | Cómo se cubre |
|---------|--------------|
| Inyección SQL | JPA / Hibernate genera consultas parametrizadas — no se usa SQL dinámico |
| HTTPS en producción | Gestionado por Google Cloud Run en todos los ambientes desplegados |
| CORS en producción | Gestionado por Google Cloud Run; no necesario en desarrollo local ni testing |

Lo que queda **fuera del alcance** del MVP:

| Control | Extensión futura |
|---------|-----------------|
| Rate limiting / throttling | API Gateway o filtro de Spring Security |
| WAF (Web Application Firewall) | Google Cloud Armor |
| Rotación de secrets | Secret Manager + rotación programada |
| Headers de seguridad HTTP | Spring Security o configuración de nginx |
| Validación centralizada de inputs | `@Valid` + `ConstraintViolationException` handler global |

---

### Paginación

La lista de libros retorna todos los registros sin paginación.

**Extensión futura:** Spring Data JPA + `Pageable` permite agregar paginación sin modificar
la lógica de negocio ni el contrato de la API (se extiende con parámetros opcionales).

---

### Gestión de usuarios

No existe módulo de usuarios, perfiles ni roles.

**Extensión futura:** implementable como módulo independiente una vez activa la autenticación.

---

### Carga masiva de libros

No se contempla importación por archivo (CSV, Excel u otros formatos).

**Extensión futura:** endpoint separado `/api/v1/books/import` sin impacto en los endpoints
CRUD existentes.

---

### Internacionalización (i18n)

La UI está en español. No se implementa soporte multi-idioma.

---

## Criterios de aceptación del MVP completo

El proyecto se considera completo cuando:

- [ ] Los 10 entregables de la tabla anterior están disponibles y accesibles
- [ ] Las 7 operaciones funcionales (RF-01 a RF-07) están implementadas y desplegadas en producción
- [ ] El pipeline CI/CD ejecuta tests y linters en cada PR y bloquea el merge si fallan
- [ ] Un merge a `main` dispara automáticamente el despliegue a Cloud Run
- [ ] El ambiente QA está operativo y permite despliegues manuales por branch
- [ ] La API está documentada en Swagger y accesible en el ambiente de producción
- [ ] La cobertura de pruebas en SonarCloud es ≥ 80% en código nuevo
