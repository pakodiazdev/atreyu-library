# TD-11 · Seeder activo solo en `dev` y `qa`, excluido de `prod`

## Decisión

El seeder de datos de demo se implementa como un `CommandLineRunner` anotado con
`@Profile({"dev", "qa"})`. En producción el bean no existe — Spring no lo instancia,
independientemente de cualquier configuración.

El seeder es **idempotente**: usa `INSERT ... ON CONFLICT (environment) DO NOTHING` respaldado
por una restricción `UNIQUE` en la columna `environment` (migración V4). La atomicidad la garantiza
la base de datos — no hay condición de carrera si Cloud Run inicia múltiples instancias en paralelo.

## Justificación

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
