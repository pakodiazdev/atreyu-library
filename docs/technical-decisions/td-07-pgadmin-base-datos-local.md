# TD-07 · pgAdmin para gestión local de base de datos

## Decisión

El entorno de desarrollo local incluye un servicio **pgAdmin 4** en `docker-compose.yml`.
En QA y producción, el dashboard visual lo provee directamente **Supabase** (ver [TD-03](td-03-postgresql-supabase.md)).

## Justificación

Durante el desarrollo local es necesario inspeccionar tablas, verificar migraciones de Flyway,
ejecutar queries ad-hoc y revisar datos de prueba sin instalar herramientas adicionales en el host.

pgAdmin se agrega al `docker-compose.yml` como servicio adicional porque:

- **Cero fricción**: disponible automáticamente al correr `docker compose up`, sin instalación manual
- **Paridad con producción**: el mismo motor PostgreSQL, consultado con una herramienta que entiende
  todos sus tipos y extensiones
- **Aislamiento**: no contamina el host — todo corre dentro del contexto Docker del proyecto
- **Complementa Flyway**: permite verificar visualmente que las migraciones se aplicaron correctamente
  inspeccionando `flyway_schema_history` y el esquema resultante

## Separación por entorno

| Entorno | Herramienta de gestión DB | Acceso |
|---------|--------------------------|--------|
| Desarrollo local | pgAdmin 4 (en docker-compose) | `http://localhost:5050` |
| QA / Producción | Dashboard de Supabase | Consola web de Supabase |

Este diseño mantiene el principio de paridad de entornos (TD-03): el motor es siempre PostgreSQL,
pero la herramienta de administración se adapta a lo que tiene sentido en cada contexto operativo.
pgAdmin no se incluye en los entornos de QA o producción — Supabase ya provee esa capa de forma
nativa sin costo adicional.

## Variables de entorno: puerto por entorno

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
