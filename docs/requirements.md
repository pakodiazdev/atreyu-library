# Requerimientos — Atreyu Library

> Este documento define los requerimientos funcionales y no funcionales del proyecto
> Atreyu Library. Sirve como referencia de trazabilidad para issues, commits y decisiones
> técnicas a lo largo del desarrollo.

---

## Requerimientos Funcionales

| ID | Descripción |
|----|-------------|
| RF-01 | El usuario puede ver una lista de todos los libros disponibles en la biblioteca |
| RF-02 | El usuario puede buscar libros por título, autor y género |
| RF-03 | El usuario puede ver el detalle completo de un libro al seleccionarlo de la lista |
| RF-04 | El sistema genera un identificador único de negocio al crear un libro, compuesto por una letra A-Z y dos dígitos (ej. A12, B34) |
| RF-05 | El usuario puede registrar un nuevo libro con título, autor, género y año de publicación |
| RF-06 | El usuario puede editar los detalles de un libro existente |
| RF-07 | El usuario puede eliminar un libro de la biblioteca mediante su identificador único de negocio (ej. A12). Internamente el sistema opera con ULID como llave primaria para no atar una regla de negocio al identificador técnico, evitando que las 2,600 combinaciones posibles (A-Z + 00-99) se conviertan en un límite arquitectónico |

---

## Requerimientos No Funcionales

| ID | Descripción |
|----|-------------|
| RNF-01 | La solución debe estar desplegada en servidores cloud (backend, base de datos y frontend accesibles en línea) |
| RNF-02 | El código fuente debe estar versionado en un repositorio Git público |
| RNF-03 | El proyecto debe contar con un pipeline de CI/CD automatizado |
| RNF-04 | El pipeline debe ejecutar pruebas y linters automáticamente al crear un PR |
| RNF-05 | El merge a main debe bloquear si los checks de CI no pasan |
| RNF-06 | La API debe estar documentada con Swagger / OpenAPI |
| RNF-07 | El proyecto debe incluir pruebas funcionales de backend y frontend |
| RNF-08 | El proyecto debe incluir documentación de arquitectura de solución |
| RNF-09 | El proyecto debe incluir justificación de las decisiones técnicas tomadas |
| RNF-10 | El proyecto debe incluir documentación de componentes con entradas y salidas de datos |
| RNF-11 | El proyecto debe incluir diagramas UML de secuencia |
| RNF-12 | El proyecto debe incluir un prototipo de la interfaz |
| RNF-13 | El proyecto debe incluir estimación de costos de los componentes y servidores seleccionados |
| RNF-14 | La arquitectura debe estar diseñada considerando escalabilidad |
| RNF-15 | Debe existir un ambiente de pruebas (QA) que se despliega manualmente apuntando a un branch específico |
| RNF-16 | Un merge a `main` debe disparar automáticamente el despliegue a producción en Cloud Run |
