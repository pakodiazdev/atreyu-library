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

El seeder es **idempotente**: usa `INSERT ... ON CONFLICT (environment) DO NOTHING` respaldado
por una restricción `UNIQUE` en la columna `environment` (migración V4). La atomicidad la garantiza
la base de datos — no hay condición de carrera si Cloud Run inicia múltiples instancias en paralelo.

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
duplicaría los registros en cada arranque. El `INSERT ... ON CONFLICT DO NOTHING` garantiza que el
seeder funciona exactamente una vez por entorno, sin importar cuántas instancias arranquen en paralelo.
La atomicidad la provee la restricción `UNIQUE` en base de datos — no hay ventana de carrera (TOCTOU).

| Perfil | ¿Se ejecuta el seeder? | Razón |
|--------|----------------------|-------|
| `dev` | ✅ Sí (idempotente) | Verificación de deploy en desarrollo local |
| `qa` | ✅ Sí (idempotente) | Verificación de deploy en QA |
| `prod` | ❌ No — bean no existe | Excluido por `@Profile` en el contexto de Spring |

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

---

## TD-13 · Credenciales de base de datos vía `env_vars` en lugar de GCP Secret Manager

### Decisión

Las credenciales de base de datos (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
`SPRING_DATASOURCE_PASSWORD`) se pasan a Cloud Run mediante el parámetro `env_vars` de
`google-github-actions/deploy-cloudrun@v2` en esta fase del proyecto.

La alternativa recomendada — almacenar los valores en **GCP Secret Manager** y referenciarlos
con el parámetro `secrets:` de la misma action — queda como trabajo futuro documentado.

### Por qué `env_vars` por ahora

| Criterio | `env_vars` (actual) | Secret Manager (futuro) |
|----------|--------------------|-----------------------|
| Complejidad de setup | Ninguna — los valores vienen de GitHub Secrets | Requiere crear secrets en GCP, configurar `secretmanager.secretAccessor` en el SA de Cloud Run |
| Almacenamiento | Cifrado en la revisión de Cloud Run por GCP | Cifrado en Secret Manager, fuera de la revisión |
| Visibilidad con `run.viewer` | La credencial **es legible** en el metadata de la revisión | Solo el valor resuelto en runtime — no expuesto en metadata |
| Auditoría de acceso | Sin trazabilidad individual | Log de acceso por secret en Cloud Audit Logs |

### Riesgo aceptado y mitigaciones actuales

El riesgo concreto es que alguien con `roles/run.viewer` en el proyecto GCP puede leer
las credenciales de la revisión vía Console o API. Las mitigaciones aplicadas en esta fase:

1. **Las credenciales no están en el código** — viven en GitHub Secrets, nunca se commitean.
2. **Acceso al proyecto GCP está restringido por IAM** — solo el Service Account de CI y
   el owner del proyecto tienen roles en este entorno de demo.
3. **Supabase permite rotar credenciales** — en caso de compromiso, la rotación es inmediata
   desde el dashboard de Supabase sin redeploy de código.

### Trabajo futuro

Migrar a Secret Manager cuando el proyecto tenga múltiples colaboradores con acceso al
proyecto GCP o cuando se requiera auditoría formal de acceso a credenciales. El cambio
en el workflow es minimal — reemplazar `env_vars` con `secrets:` en `deploy-cloudrun`
y crear los secrets correspondientes en GCP.

---

## TD-14 · Tailwind CSS + spartan/ui como stack de UI para Angular

### Decisión

El frontend usa **Tailwind CSS** como framework de estilos y **spartan/ui** como biblioteca
de componentes headless. Angular Material y otras bibliotecas de componentes opinadas
fueron descartadas.

### Justificación

#### Por qué Tailwind CSS y no otro framework

Los wireframes del proyecto (`docs/prototyping/wireframes.html`) definen una estética custom
de "biblioteca cálida con tono fantástico" que requiere control total sobre el sistema visual:

- **Paleta de colores propia** — papel, tinte, tinta, oro, ámbar, óxido, musgo — sin correspondencia
  con ninguna paleta de sistema predefinida (Material, Bootstrap, Ant Design)
- **Tipografías editoriales** — IM Fell English (títulos), Patrick Hand (UI), Caveat (anotaciones),
  JetBrains Mono (códigos de libro)
- **Componentes visuales custom** — badges de género coloreados por categoría, cards de
  libro con bordes artesanales, sidebar de navegación con iconografía propia

Un framework de componentes opinado (Bootstrap, Material) forzaría sobreescribir su sistema
de diseño en su totalidad, generando una base de CSS en conflicto con los estilos propios.
Tailwind resuelve esto porque **no tiene opinión sobre el diseño** — provee utilidades atómicas
que se componen directamente en los templates, sin especificidad CSS que competir.

Además, Tailwind es totalmente compatible con **Angular 21 standalone components + signals**:
las clases se aplican en el template, no hay integración con el sistema de detección de cambios.

#### Por qué spartan/ui y no Angular Material u otras alternativas

| Criterio | Angular Material | spartan/ui |
|----------|-----------------|------------|
| Integración con Tailwind | Conflicto de estilos — Material tiene su propio sistema de theming | Nativa — construida sobre Tailwind CSS |
| Propiedad del código | Componentes como dependencia opaca | Los componentes se copian al proyecto — el equipo los posee y modifica |
| Compatibilidad con Angular 21 | Compatible | Compatible — construida con CDK + signals |
| Flexibility visual | Alta resistencia al override | Control total — el HTML y CSS están en el proyecto |
| Filosofía de diseño | Impone Material Design | Headless — solo lógica, sin visual opinion |

**spartan/ui** implementa la filosofía de shadcn/ui (ampliamente adoptada en React) para Angular:
los componentes no son una caja negra en `node_modules` sino archivos que viven en el proyecto,
copiados mediante CLI. Esto permite ajustar botones, diálogos y tablas a la estética del wireframe
sin pelear contra una biblioteca externa.

Componentes de spartan/ui que cubre este proyecto: `hlm-button`, `hlm-dialog`, `hlm-table`,
`hlm-badge`, `hlm-card`, `hlm-input`, `hlm-select`.

#### Alternativas descartadas

- **Angular Material**: visual language de Material Design incompatible con la estética definida
  en los wireframes. Sobrescribir el theming completo (paleta, tipografía, forma de componentes)
  requeriría más trabajo que construir directamente con Tailwind.
- **Bootstrap**: framework orientado a proyectos con look genérico. Su sistema de grid y
  componentes predefinidos añaden peso sin aportar valor en un diseño custom como este.
- **shadcn/ui**: exclusivo de React — construido sobre Radix UI que no tiene soporte para Angular.
  spartan/ui es el equivalente Angular mantenido activamente.

### Impacto en la arquitectura

Tailwind se integra en el build de Angular vía **PostCSS** (`postcss.config.json`), usando
el plugin `@tailwindcss/postcss`. El builder de Angular (`@angular/build`) requiere el
archivo de configuración en formato JSON — el formato `.mjs` es ignorado en la pipeline de
build estándar.

Los tokens de diseño (colores, tipografías, espaciado) se definen directamente en
`src/styles.css` dentro del bloque `@theme {}`, que es la forma nativa de Tailwind CSS v4
para extender el tema. No existe `tailwind.config.js` — ese archivo es un artefacto de
Tailwind v3 que en v4 queda obsoleto.

Los componentes de spartan/ui se incorporarán en `code/frontend/src/app/shared/ui/` y se
consumirán como standalone components desde cualquier feature del proyecto. Este directorio
se crea cuando se introduzca spartan/ui en un issue dedicado.

## TD-15 · Servicios de frontend y backend separados en Cloud Run

### Decisión

Frontend (Angular) y backend (Spring Boot) se despliegan como **servicios independientes en
Cloud Run**, resultando en 4 servicios en total: `atreyu-backend`, `atreyu-frontend`,
`atreyu-backend-qa` y `atreyu-frontend-qa`.

La alternativa considerada — un container único con nginx sirviendo el frontend estático
y actuando como reverse proxy hacia el backend — fue descartada.

### Justificación

**Escalado independiente** — Cloud Run escala por servicio según la carga recibida.
El backend puede requerir múltiples instancias durante picos de escritura mientras el
frontend (archivos estáticos) necesita una sola. Con un container combinado, ambos
escalan juntos aunque solo uno lo necesite, aumentando costo y latencia innecesariamente.

**Deploy independiente** — un cambio en el frontend no requiere reconstruir ni redeployar
el backend, y viceversa. Con un container combinado cada deploy reconstruye la imagen
completa aunque solo haya cambiado una de las partes.

**Un proceso por container** — el contrato de Cloud Run (y de contenedores en general)
es un proceso principal por container. Meter nginx + JVM en un mismo container requiere
un process manager (supervisord o similar), añade complejidad operacional y viola el
principio de responsabilidad única a nivel de infraestructura.

**Trazabilidad y observabilidad** — los logs, métricas y alertas de Cloud Run están
aislados por servicio. Con servicios separados es inmediato saber si un problema es
de frontend o de backend sin cruzar logs de dos procesos en un mismo container.

| Criterio | Servicios separados (actual) | Container combinado |
|----------|-----------------------------|--------------------|
| Escalado | Independiente por carga real | Acoplado — escalan juntos |
| Deploy | Independiente por componente | Siempre reconstruye todo |
| Logs / métricas | Aislados por servicio | Mezclados en un container |
| Complejidad de imagen | Dockerfile simple por cada uno | Requiere nginx + JVM + process manager |
| Patrón cloud-native | ✅ Estándar | ❌ Patrón de servidor tradicional (VM) |

### Alternativa descartada

Un container con nginx sirviendo `dist/` de Angular y haciendo `proxy_pass` al backend
en el mismo pod es el patrón clásico de un servidor web tradicional. Es válido en un
VPS o on-premise, pero en Cloud Run introduce acoplamiento innecesario y va en contra
del modelo de escalado del servicio.

### CORS

La separación implica que el frontend en producción llama al backend desde un dominio
distinto. Esto se resuelve con configuración de CORS en Spring Boot — trabajo previsto
al implementar los endpoints REST (Issue #6 en adelante).

---

## TD-16 · Ninguna superficie del proyecto se expone a indexación por buscadores

### Decisión

Tanto el frontend (producción y QA) como el backend API responden con la cabecera
`X-Robots-Tag: noindex, nofollow` en todas sus rutas. Adicionalmente, el frontend
sirve un `robots.txt` con `Disallow: /`. El entorno QA añade una capa de
**HTTP Basic Auth** sobre nginx para restringir el acceso a personas autorizadas.

### Implementación por superficie

| Superficie | Mecanismo | Alcance |
|---|---|---|
| Frontend QA | `nginx-qa.conf`: `X-Robots-Tag` + `robots.txt` + `auth_basic` | Todas las rutas |
| Frontend producción | `nginx.conf`: `X-Robots-Tag` + `robots.txt` | Todas las rutas |
| Backend API (todos los ambientes) | `NoIndexFilter` (`@ConditionalOnProperty`) activado en `application.properties` | Todas las respuestas HTTP |

### Justificación

**Por qué no indexar ninguna superficie:**

Atreyu Library es una **prueba técnica**, no un producto destinado al público general.
Que las URLs aparezcan en resultados de búsqueda no aporta valor al proyecto y
genera ruido — un evaluador externo podría confundir una URL de QA con producción,
o encontrar el demo en un estado parcial durante el desarrollo.

El backend es una **API REST** — sus endpoints devuelven JSON y no tienen sentido
semántico para un motor de búsqueda. Indexarlos no aportaría valor y podría exponer
la estructura interna de la API a scrapers.

**Por qué Basic Auth en QA y no en producción:**

El ambiente de QA es una ventana de pre-producción donde los cambios se validan antes
de llegar a los usuarios. Limitar el acceso garantiza que:

- Solo el equipo de desarrollo y los revisores designados acceden a estados intermedios del producto
- Los datos de prueba (seeder) no se confunden con datos reales de producción
- El ambiente puede estar en un estado intencionalmente incompleto sin que eso sea visible externamente

En producción no se aplica Basic Auth porque el objetivo es que el producto sea
accesible (aunque no indexado): evaluadores técnicos y stakeholders deben poder
acceder sin fricción adicional.

**Por qué `NoIndexFilter` activo por defecto en el backend:**

Una API REST nunca debe indexarse, independientemente del ambiente. El filtro se
activa en `application.properties` (base) para que aplique en dev, QA y producción
sin necesidad de configurarlo por perfil. Si en el futuro el proyecto evoluciona hacia
un backend con endpoints renderizados para buscadores (SEO server-side), este default
puede sobreescribirse por perfil.

### Nota sobre las credenciales de QA en el README

Las credenciales del ambiente QA (`qa` / `preview`) están documentadas intencionalmente
en el `README.md` para facilitar la verificación del demo por parte del evaluador.
En un proyecto productivo, las credenciales de acceso a entornos restringidos se
gestionarían a través de un gestor de secretos (1Password, HashiCorp Vault, etc.)

---

## TD-17 · BIGSERIAL como PK interna + ULID como identificador externo de la API

### Decisión

La tabla `books` usa dos identificadores con responsabilidades distintas:

| Campo | Tipo | Rol |
|-------|------|-----|
| `id` | `BIGSERIAL` | PK interna — nunca sale de la base de datos |
| `ulid` | `VARCHAR(26)` | Identificador externo — expuesto en la API para operaciones mutantes |
| `code` | `VARCHAR(3)` | Identificador de negocio — visible en la UI para búsqueda y selección |

Los endpoints de escritura (`PUT /books/{ulid}`, `DELETE /books/{ulid}`) usan el ULID como parámetro de ruta. El `code` se usa exclusivamente en la interfaz de usuario para que el usuario identifique y seleccione un libro; internamente el frontend trabaja con el ULID que recibe en el `GET /books`.

### Justificación

**¿Por qué no solo `code`?**
El `code` (A00–Z99) tiene 2 600 combinaciones — completamente enumerable. Exponer un identificador así en operaciones de escritura permitiría escanear y mutar el catálogo completo con un bucle trivial.

**¿Por qué no ULID como PK?**
Los ULIDs como PK (`VARCHAR(26)`) tienen un costo real en PostgreSQL: índices más grandes, JOINs más lentos y mayor uso de disco frente a un `BIGINT`. Si el identificador externo y la PK interna cumplen roles distintos, no hay razón para forzar el mismo campo a hacer los dos trabajos.

**¿Por qué no UUID como identificador externo?**
El ULID es ordenable por tiempo de inserción, lo que permite paginación eficiente con cursores en el futuro (`WHERE ulid > :cursor ORDER BY ulid`). Un UUID v4 aleatorio no ofrece esta propiedad.

**¿Por qué no entero autoincremental como identificador externo?**
Un `id` secuencial expuesto en la API revela el volumen del catálogo (`/books/1`, `/books/2`... `/books/847`) y permite enumerar todos los recursos con un bucle. El ULID no es predecible ni revela información sobre el número total de registros.

### Flujo de referencia

```
API REST                              Frontend (Angular)
────────────────────────────────      ─────────────────────────────────────
GET /api/v1/books                 →   lista: [{ ulid, code, title, ... }]
                                                ↓
                                      usuario ve "A04 — Don Quijote..."
                                                ↓
                                      navega a /libros/A04-don-quijote-de-la-mancha
                                                ↓
                                      Angular extrae code del slug → "A04"
                                      busca ulid en el store local
                                                ↓
GET /api/v1/books/{ulid}          ←   llama con el ulid del libro seleccionado
DELETE /api/v1/books/{ulid}       ←   ídem para operaciones mutantes
```

### Ruta de frontend: `/libros/{code}-{titulo-en-slug}`

Las rutas del frontend siguen el patrón `/{code}-{titulo-slugificado}` (p.ej. `/libros/A04-don-quijote-de-la-mancha`). Este esquema:

- **No es enumerable por sí solo** en la práctica — el `code` tiene 2 600 combinaciones pero el slug incluye el título, y una URL sin título válido no resuelve nada útil.
- **Es compatible con SEO y marcadores** — la URL es legible y estable; si el título cambia, la URL "vieja" sigue funcionando porque `code` no varía.
- **Desacopla la URL de la API** — el `code` en la URL es solo para que Angular recupere el `ulid` del store; la API nunca recibe el `code` como parámetro de ruta.

El router de Angular define el parámetro como `:slug`; el componente extrae el `code` con `slug.split('-')[0]`.

### Alternativa descartada

Un solo identificador ULID como PK y campo externo es válido y más simple. Se descartó por el costo de rendimiento en PostgreSQL frente a un `BIGINT` cuando la PK nunca necesita ser visible al cliente.

### Cuándo revisar

Si el proyecto adopta sharding o replicación multi-región donde las PKs secuenciales generan colisiones, migrar la PK interna a ULID o UUID sería el paso natural.
y nunca se incluirían en el repositorio.