# Decisiones Técnicas — Atreyu Library

> Este documento registra las decisiones técnicas relevantes tomadas durante el diseño y
> desarrollo del proyecto, junto con su justificación. Su objetivo es dar contexto a
> futuros revisores o colaboradores sobre el razonamiento detrás de cada elección.

---

## TD-01 · ULID como llave primaria, código de negocio como identificador secundario

### Decisión

El modelo `Book` utiliza **ULID** como llave primaria técnica. El campo `code` (formato A-Z + 00-99,
ej. `A12`, `B34`) es un **identificador secundario de negocio**, visible en la UI y útil para
búsqueda, pero nunca expuesto como PK en operaciones internas.

### Justificación

El algoritmo de identificación definido en los requerimientos genera códigos del tipo `A12`:
una letra (A-Z) seguida de dos dígitos (00-99), lo que produce un universo de únicamente
**2,600 combinaciones posibles**.

Usar este código como llave primaria introduciría un límite arquitectónico directo:
la base de datos no podría almacenar más de 2,600 libros sin violar la unicidad. Esta es
una **restricción de negocio** que no debería condicionar la arquitectura técnica.

La separación de responsabilidades es clara:

| Campo | Rol | Visibilidad |
|-------|-----|-------------|
| `id` (ULID) | Identificador técnico, PK real | Interno — nunca expuesto en UI |
| `code` | Identificador de negocio, código de búsqueda | UI, búsqueda, referencia humana |

### Impacto en escalabilidad

El sistema puede crecer sin límite de registros independientemente del formato del `code`.
Si en el futuro el cliente decide cambiar el algoritmo de generación (por ejemplo, ampliar
a tres dígitos o agregar más letras), **el cambio es únicamente en la lógica de generación
del código** — la arquitectura de base de datos, los endpoints y la lógica interna no se
ven afectados.

El ULID como PK garantiza:
- Unicidad global sin depender de secuencias de base de datos
- Ordenamiento cronológico implícito
- Sin colisiones en escenarios distribuidos

---

## TD-02 · Google Cloud Run como plataforma de despliegue

### Decisión

El despliegue en cloud se realiza sobre **Google Cloud Run**.

### Justificación

Cloud Run es una plataforma serverless administrada que permite ejecutar contenedores
sin gestionar infraestructura. Para el alcance de este proyecto ofrece exactamente lo
necesario:

- **Autoscaling automático** — escala según demanda sin configuración adicional
- **Scale-to-zero** — costo cero cuando no hay tráfico, ideal para un MVP
- **Sin administración de clúster** — el foco permanece en el producto, no en la operación
- **Despliegue desde contenedores Docker** — compatible directamente con el stack definido
- **Crecimiento progresivo** — si el proyecto escala, la migración a una infraestructura
  más robusta es posible sin cambios en el código de la aplicación

---

## TD-03 · PostgreSQL como motor de base de datos — Supabase como proveedor del demo

### Decisión

El motor de base de datos es **PostgreSQL**. Para el ambiente de demo, el hosting se
realiza en **Supabase** (tier gratuito).

### Justificación del motor

- Stack enterprise y corporativo, estándar en entornos productivos con Spring Boot
- El modelo de datos es claro y bien definido (entidad `Book` con esquema estático),
  lo que hace de una base de datos relacional la elección natural
- Integración nativa con Spring Data JPA sin capas adicionales de abstracción

### Justificación del proveedor (Supabase)

La elección del proveedor es una **decisión operativa y financiera**, independiente
del motor. El código de la aplicación no distingue entre proveedores — Spring Boot
se conecta a través de un connection string estándar de PostgreSQL.

Supabase se elige para el demo por:

- **Costo cero** en tier gratuito (500MB, más que suficiente para el demo)
- **Dashboard visual** — permite mostrar tablas, registros y queries durante la
  presentación, lo que aporta valor demostrativo
- **PostgreSQL puro** por debajo — sin adaptaciones ni drivers especiales
- **Portabilidad total** — migrar a Cloud SQL, RDS o cualquier otro proveedor
  PostgreSQL es únicamente un cambio de connection string en las variables de
  entorno de Cloud Run, sin tocar el código

### Estrategia de escalabilidad

Si el proyecto crece y requiere mayor capacidad, la migración a un proveedor más
robusto (Google Cloud SQL, Amazon RDS, etc.) es transparente para la aplicación.
Esta portabilidad es una ventaja directa de usar un motor estándar con JPA como
capa de abstracción.

---

## TD-04 · Monorepo

### Decisión

Frontend y backend conviven en un **único repositorio** (`atreyu-library/`), organizados
bajo `code/backend/` y `code/frontend/`. La configuración de Docker se centraliza en `docker/`.

### Justificación

- Simplifica la revisión técnica — el evaluador clona un solo repo y tiene el proyecto completo
- CI/CD más limpio: un solo lugar de configuración
- Cambios que afectan ambas capas quedan en el mismo PR y el mismo historial
- La carpeta `docker/` centraliza todos los Dockerfiles y configuraciones de nginx,
  separando la infraestructura del código de la aplicación
- Para el alcance de este proyecto no existe ventaja real en separar los repositorios

---

## TD-05 · Prioridad de desarrollo: Lectura → Actualización → Creación → Eliminación

### Decisión

El orden de implementación de las operaciones CRUD no sigue el orden convencional
(Create → Read → Update → Delete), sino uno basado en **valor de negocio**:

1. Infraestructura
2. Lectura
3. Actualización
4. Creación
5. Eliminación

### Justificación

- **Lectura primero**: la consulta de datos es la operación de mayor frecuencia y valor
  inmediato para el usuario final.
- **Actualización antes de Creación**: al contar con datos iniciales provistos por el
  seeder, la funcionalidad de edición puede entregar valor real sin depender de que el
  usuario haya creado registros. La Creación queda al final porque su valor es la
  **autonomía del usuario** para gestionar su propio catálogo, no un prerrequisito
  funcional para las operaciones anteriores.
- Esta secuencia sirve también como demostración explícita de **priorización basada en
  valor**, no en conveniencia técnica.

---

## TD-06 · Claude Design como herramienta de prototipado

### Decisión

Los wireframes interactivos de la UI (`docs/prototyping/wireframes.html`) se generan
con **Claude Design**, dentro del mismo esquema de AI-assisted development que el
proyecto adopta para codificación (Claude Code, GitHub Copilot) y revisión (Devin).
Cada capa del flujo tiene un agente especializado; Claude Design es el responsable
de la capa de diseño y prototipado.

### Justificación

- Produce prototipos funcionales en HTML/CSS/JS en un único archivo autocontenido,
  sin dependencias externas ni herramientas de diseño adicionales
- El archivo `.html` se visualiza directamente en el navegador y se versiona en el
  repositorio sin builds ni bundlers
- El formato es legible, editable y previsualizable dentro del mismo entorno de
  desarrollo, sin licencias ni acceso a servicios de terceros

