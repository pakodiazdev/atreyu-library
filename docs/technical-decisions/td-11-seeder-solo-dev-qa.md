# TD-11 · Seeders activos en `dev`, `qa-init` y `prod-init` — ejecutados por Cloud Run Job

## Decisión

Los seeders de datos de demo se implementan como `CommandLineRunner` que heredan de
`OnceSeeder`. En producción y QA, el bean existe pero **solo se ejecuta durante el
Cloud Run Job de inicialización** (`prod-init` / `qa-init`) — nunca en el servicio
web desplegado.

El seeder es **idempotente**: antes de insertar, consulta la tabla `seeder_log` para
verificar si ya corrió. Si el registro existe, el seeder sale sin hacer nada.
`OnceSeeder` encapsula esta lógica para todos los seeders del proyecto.

## Justificación

**Antes (problema):** los seeders corrían como `CommandLineRunner` en cada arranque de
Spring Boot, incluyendo los cold starts de Cloud Run. Esto significaba que en QA los
datos se limpiaban y resembraban en cada scale-to-zero recovery del servicio. En
producción existía el riesgo de contención de locks de Flyway en arranques paralelos.

**Ahora:** los seeders solo corren durante el job de deploy (`migrate-and-seed` en los
workflows de GitHub Actions), con `spring.main.web-application-type=none`. Spring Boot
arranca en modo no-web, ejecuta los `CommandLineRunner`s y sale solo. El servicio web
desplegado después recibe `SPRING_FLYWAY_ENABLED=false` y no ejecuta ninguna migración
ni seeder al arrancar.

**Por qué `seeder_log` en lugar de `INSERT ON CONFLICT`:**

`seeder_log` permite al seeder abortar antes de evaluar cualquier dato — la idempotencia
está garantizada por una fila explícita en la base de datos, no por constraints de
unicidad en las tablas sembradas. Esto es necesario en QA donde `Flyway clean` borra
todas las tablas (incluidas las de datos) antes de re-migrar.

**Por qué sí correr seeders en producción (via `prod-init`):**

Los datos sembrados en producción son los datos de demo iniciales de la biblioteca.
Sin seeders, el catálogo de producción quedaría vacío tras cada deploy. La barrera
contra datos duplicados la provee `seeder_log` — si el seeder ya corrió, no vuelve
a insertar nada.

| Perfil | ¿Se ejecuta el seeder? | Cuándo | Mecanismo de idempotencia |
|--------|----------------------|--------|--------------------------|
| `dev` | ✅ Sí | Cada `docker compose up` | `seeder_log` |
| `qa-init` | ✅ Sí | Cloud Run Job en cada deploy QA | `seeder_log` (BD limpia por Flyway clean) |
| `prod-init` | ✅ Sí | Cloud Run Job en cada deploy prod | `seeder_log` |
| `qa` (servicio web) | ❌ No | — | `SPRING_FLYWAY_ENABLED=false`, sin seeder |
| `prod` (servicio web) | ❌ No | — | `SPRING_FLYWAY_ENABLED=false`, sin seeder |
