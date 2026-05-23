# TD-06 · Flyway para gestión del esquema de base de datos

## Decisión

El esquema de base de datos se gestiona exclusivamente con **migraciones versionadas de Flyway**.
La opción `spring.jpa.hibernate.ddl-auto` está fijada en `none` — Hibernate no toca el esquema
en ningún entorno.

## Justificación

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

## Convención de migraciones

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

## Flyway en Cloud Run — ejecución por deploy, no por cold start

En Cloud Run los contenedores se destruyen al no tener tráfico y se recrean en frío.
Si Flyway corre en cada arranque de Spring Boot, existe riesgo de contención de locks
(`flyway_schema_history`) cuando múltiples instancias arrancan en paralelo durante un
pico de tráfico.

**Solución:** Flyway se ejecuta una sola vez por deploy, en un **Cloud Run Job** dedicado
que corre antes de desplegar los servicios. Los servicios web reciben
`SPRING_FLYWAY_ENABLED=false` y no ejecutan migraciones al arrancar.

### Perfiles Spring Boot para los jobs de inicialización

Se usan **Profile Groups** de Spring Boot (disponibles desde 2.4) para que los perfiles
`qa-init` y `prod-init` hereden toda la configuración del perfil base (`qa` / `prod`)
sin necesidad de duplicarla:

```properties
# application.properties
spring.profiles.group.qa-init=qa
spring.profiles.group.prod-init=prod
```

Cada perfil `-init` solo añade las propiedades exclusivas del job:

```properties
# application-prod-init.properties
spring.main.web-application-type=none   # Spring arranca, corre CommandLineRunners y sale

# application-qa-init.properties
spring.flyway.clean-disabled=false      # QA: limpiar BD antes de migrar
spring.main.web-application-type=none
```

### Flujo por ambiente

| Ambiente | Quién ejecuta Flyway | Cuándo | `clean` |
|----------|---------------------|--------|---------|
| Local (`dev`) | Spring Boot al arrancar | Cada `docker compose up` | No |
| QA | Cloud Run Job (`qa-init`) | Cada deploy desde GitHub Actions | Sí |
| Prod | Cloud Run Job (`prod-init`) | Cada deploy desde GitHub Actions | No |
| Servicio web QA/prod | — | Nunca (`FLYWAY_ENABLED=false`) | — |
