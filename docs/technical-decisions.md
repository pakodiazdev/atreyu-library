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

## TD-06 · Flyway para gestión del esquema de base de datos

### Decisión

El esquema de base de datos se gestiona exclusivamente con **migraciones versionadas de Flyway**.
La opción `spring.jpa.hibernate.ddl-auto` está fijada en `none` — Hibernate no toca el esquema
en ningún entorno.

### Justificación

`ddl-auto` genera o actualiza tablas automáticamente a partir de las entidades JPA. Aunque es
conveniente durante el prototipado inicial, introduce problemas estructurales:

- **Sin trazabilidad**: los cambios al esquema no quedan registrados en el historial de versiones
- **Sin rollback controlado**: no existe un mecanismo formal para revertir cambios al esquema
- **Divergencia de entornos**: dev puede tener un esquema distinto a QA o producción sin que
  nadie lo detecte hasta que hay un error en producción
- **No apto para producción**: en entornos productivos, `ddl-auto=update` puede destruir datos
  si se renombra o elimina una columna

Flyway resuelve estos problemas con el patrón estándar de la industria:

| Característica | `ddl-auto` | Flyway |
|----------------|-----------|--------|
| Versionado en git | ✗ | ✅ — cada migración es un archivo SQL |
| Historial de cambios | ✗ | ✅ — tabla `flyway_schema_history` |
| Aplicación reproducible | ✗ | ✅ — misma secuencia en todos los entornos |
| Segura en producción | ✗ | ✅ — solo aplica migraciones nuevas, nunca toca datos |

### Convención de migraciones

```
code/backend/src/main/resources/db/migration/
├── V1__baseline.sql          # Esquema vacío inicial
├── V2__create_books_table.sql
└── V{n}__{descripcion}.sql
```

- El número de versión `V{n}` es secuencial e irrepetible
- La descripción usa `snake_case` y describe la intención (no la entidad)
- Cada migración es atómica — si falla, la transacción completa se revierte
- Las migraciones nunca se editan una vez aplicadas — si hay un error, se crea una nueva migración correctiva

---

## TD-07 · pgAdmin para gestión local de base de datos

### Decisión

El entorno de desarrollo local incluye un servicio **pgAdmin 4** en `docker-compose.yml`.
En QA y producción, el dashboard visual lo provee directamente **Supabase** (ver TD-03).

### Justificación

Durante el desarrollo local es necesario inspeccionar tablas, verificar migraciones de Flyway,
ejecutar queries ad-hoc y revisar datos de prueba sin instalar herramientas adicionales en el host.

pgAdmin se agrega al `docker-compose.yml` como servicio adicional porque:

- **Cero fricción**: disponible automáticamente al correr `docker compose up`, sin instalación manual
- **Paridad con producción**: el mismo motor PostgreSQL, consultado con una herramienta que entiende
  todos sus tipos y extensiones
- **Aislamiento**: no contamina el host — todo corre dentro del contexto Docker del proyecto
- **Complementa Flyway**: permite verificar visualmente que las migraciones se aplicaron correctamente
  inspeccionando `flyway_schema_history` y el esquema resultante

### Separación por entorno

| Entorno | Herramienta de gestión DB | Acceso |
|---------|--------------------------|--------|
| Desarrollo local | pgAdmin 4 (en docker-compose) | `http://localhost:5050` |
| QA / Producción | Dashboard de Supabase | Consola web de Supabase |

Este diseño mantiene el principio de paridad de entornos (TD-03): el motor es siempre PostgreSQL,
pero la herramienta de administración se adapta a lo que tiene sentido en cada contexto operativo.
pgAdmin no se incluye en los entornos de QA o producción — Supabase ya provee esa capa de forma
nativa sin costo adicional.

### Variables de entorno: puerto por entorno

La estrategia de conexión difiere entre entornos:

| Entorno | ¿Cómo se configura el puerto? |
|---------|------------------------------|
| **Dev** | `docker-compose.yml` construye la URL con `postgres:5432` (interno Docker, siempre fijo) |
| **QA / Prod** | `SPRING_DATASOURCE_URL` completa en Cloud Run — puerto incluido en la URL |

En **desarrollo**, la JDBC URL se compone en `docker-compose.yml`:
```
jdbc:postgresql://postgres:5432/${POSTGRES_DB}
```
El puerto `5432` es el estándar de la imagen `postgres:16-alpine` dentro de la red Docker.
`POSTGRES_FW_PORT` solo controla qué puerto del **host** se expone para herramientas externas
(pgAdmin, DBeaver) y varía por entorno para evitar conflictos cuando hay múltiples entornos en paralelo.

En **QA y producción**, Spring Boot recibe `SPRING_DATASOURCE_URL` como URL completa vía
Cloud Run — host, puerto y base de datos incluidos:
```
SPRING_DATASOURCE_URL=jdbc:postgresql://db.supabase.co:5432/atreyu
```
Si Supabase usa un puerto diferente (p. ej. `6543` para pgBouncer), basta con ajustar
esa variable en Cloud Run. No hay nada hardcodeado en el código de la aplicación.

---

## TD-08 · Claude Design como herramienta de prototipado

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

---

## TD-09 · Estrategia de CD: deploy automático a prod, manual a QA

### Decisión

El pipeline de entrega continua opera con dos flujos diferenciados:

- **Producción** (`cd.yml`): deploy automático en cada merge a `main`
- **QA** (`qa-deploy.yml`): deploy manual vía `workflow_dispatch`, seleccionando el branch a promover

### Justificación

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

### Alternativa descartada

Un flujo simétrico (ambos manuales o ambos automáticos) fue descartado:
- **Ambos automáticos**: QA se sobrescribiría con cada push a cualquier branch, imposibilitando
  validaciones de larga duración
- **Ambos manuales**: prod requeriría un paso manual después de un merge ya aprobado — proceso
  sin valor añadido que ralentiza la entrega

---

## TD-10 · Acceso público a los servicios de Cloud Run (`--allow-unauthenticated`)

### Decisión

Los cuatro servicios desplegados en Cloud Run (backend prod, backend QA, frontend prod, frontend QA)
se configuran con acceso no autenticado — cualquier cliente puede hacer requests sin un token de
identidad de Google.

### Justificación

Por defecto, Cloud Run despliega servicios **privados**: solo aceptan requests con un header
`Authorization: Bearer <google-identity-token>`. Esta protección tiene sentido para servicios
internos (microservicios que solo se llaman entre sí), pero no para una API pública.

Atreyu Library es una aplicación de catálogo destinada a usuarios finales y a evaluadores técnicos
que acceden desde sus navegadores o herramientas como Postman. Requerir autenticación de GCP
haría el sistema imposible de usar sin credenciales de la cuenta de GCP.

**Nota de seguridad**: la autenticación de la *aplicación* (login de usuarios, JWT, roles) es
responsabilidad de la capa de negocio, no de la infraestructura de red. Esta decisión está
documentada en la arquitectura como trabajo futuro (Spring Security + JWT). El acceso público
a nivel de Cloud Run no equivale a una API sin control de acceso — significa que Cloud Run
no añade una capa adicional de autenticación de infraestructura que no corresponde a este nivel.

### Impacto

| Escenario | Configuración correcta |
|-----------|----------------------|
| API pública / frontend web | `--allow-unauthenticated` ✅ |
| Microservicio interno (solo lo llama otro servicio) | Sin `--allow-unauthenticated` + service account |
| Admin interno | Sin `--allow-unauthenticated` + IAP (Identity-Aware Proxy) |

---

## TD-11 · Seeder activo solo en `dev` y `qa`, excluido de `prod`

### Decisión

El seeder de datos de demo se implementa como un `CommandLineRunner` anotado con
`@Profile({"dev", "qa"})`. En producción el bean no existe — Spring no lo instancia,
independientemente de cualquier configuración.

El seeder es **idempotente**: verifica si ya existen registros antes de insertar.
Si la tabla tiene datos, no hace nada. Puede ejecutarse múltiples veces sin efectos secundarios.

### Justificación

**Por qué excluir prod:**

Los datos de producción son responsabilidad del usuario final, no del sistema de despliegue.
Insertar registros automáticamente en prod introduciría datos artificiales que contaminarían
el catálogo real de la biblioteca. Una vez en prod, eliminar esos registros requeriría
intervención manual — un proceso frágil y propenso a errores humanos.

`@Profile` es la barrera más robusta disponible en Spring Boot: no es una condición evaluada
en runtime que podría fallar silenciosamente — es una decisión del contenedor de IoC al momento
de inicializar el contexto. Si el perfil activo es `prod`, el bean directamente no existe.

**Por qué idempotente:**

Sin idempotencia, un reinicio del contenedor (escalado de Cloud Run, redeploy, crash recovery)
duplicaría los registros en cada arranque. La verificación `COUNT(*) > 0` garantiza que el
seeder funciona exactamente una vez por base de datos, sin importar cuántas veces arranque
el contenedor.

| Perfil | ¿Se ejecuta el seeder? | Razón |
|--------|----------------------|-------|
| `dev` | ✅ Sí (si tabla vacía) | Datos de demo para desarrollo local |
| `qa` | ✅ Sí (si tabla vacía) | Datos de demo para validación funcional |
| `prod` | ❌ No — bean no existe | Datos reales, responsabilidad del usuario |

---

## TD-12 · Artifact Registry sobre Docker Hub como registro de imágenes

### Decisión

Las imágenes Docker de backend y frontend se almacenan en **Google Artifact Registry**
(`us-central1-docker.pkg.dev/atreyu-library/atreyu/`) en lugar de Docker Hub u otro registro público.

### Justificación

| Criterio | Artifact Registry | Docker Hub |
|----------|------------------|------------|
| Autenticación con Cloud Run | Nativa — misma cuenta GCP, sin secrets adicionales | Requiere configurar credenciales separadas |
| Latencia de pull | Mínima — mismo datacenter que Cloud Run | Mayor — tráfico externo |
| Costo de egreso | Sin costo dentro de GCP | Costo de transferencia saliente |
| Control de acceso | IAM de GCP — mismos roles del proyecto | Cuenta Docker Hub independiente |
| Límites de rate | Sin límites dentro del proyecto | Rate limiting en tier gratuito |
| Privacidad | Privado por defecto | Requiere configuración explícita |

Al desplegar en Cloud Run con `google-github-actions/auth`, el Service Account ya tiene
permisos sobre Artifact Registry (`roles/artifactregistry.writer`). No se requiere ningún
secret adicional para autenticar el push ni el pull de imágenes — es transparente dentro
del ecosistema GCP.

