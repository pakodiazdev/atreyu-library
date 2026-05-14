# TD-13 · Credenciales de base de datos vía `env_vars` en lugar de GCP Secret Manager

## Decisión

Las credenciales de base de datos (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
`SPRING_DATASOURCE_PASSWORD`) se pasan a Cloud Run mediante el parámetro `env_vars` de
`google-github-actions/deploy-cloudrun@v2` en esta fase del proyecto.

La alternativa recomendada — almacenar los valores en **GCP Secret Manager** y referenciarlos
con el parámetro `secrets:` de la misma action — queda como trabajo futuro documentado.

## Por qué `env_vars` por ahora

| Criterio | `env_vars` (actual) | Secret Manager (futuro) |
|----------|--------------------|-----------------------|
| Complejidad de setup | Ninguna — los valores vienen de GitHub Secrets | Requiere crear secrets en GCP, configurar `secretmanager.secretAccessor` en el SA de Cloud Run |
| Almacenamiento | Cifrado en la revisión de Cloud Run por GCP | Cifrado en Secret Manager, fuera de la revisión |
| Visibilidad con `run.viewer` | La credencial **es legible** en el metadata de la revisión | Solo el valor resuelto en runtime — no expuesto en metadata |
| Auditoría de acceso | Sin trazabilidad individual | Log de acceso por secret en Cloud Audit Logs |

## Riesgo aceptado y mitigaciones actuales

El riesgo concreto es que alguien con `roles/run.viewer` en el proyecto GCP puede leer
las credenciales de la revisión vía Console o API. Las mitigaciones aplicadas en esta fase:

1. **Las credenciales no están en el código** — viven en GitHub Secrets, nunca se commitean.
2. **Acceso al proyecto GCP está restringido por IAM** — solo el Service Account de CI y
   el owner del proyecto tienen roles en este entorno de demo.
3. **Supabase permite rotar credenciales** — en caso de compromiso, la rotación es inmediata
   desde el dashboard de Supabase sin redeploy de código.

## Trabajo futuro

Migrar a Secret Manager cuando el proyecto tenga múltiples colaboradores con acceso al
proyecto GCP o cuando se requiera auditoría formal de acceso a credenciales. El cambio
en el workflow es minimal — reemplazar `env_vars` con `secrets:` en `deploy-cloudrun`
y crear los secrets correspondientes en GCP.
