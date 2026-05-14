# TD-12 · Artifact Registry sobre Docker Hub como registro de imágenes

## Decisión

Las imágenes Docker de backend y frontend se almacenan en **Google Artifact Registry**
(`us-central1-docker.pkg.dev/atreyu-library/atreyu/`) en lugar de Docker Hub u otro registro público.

## Justificación

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
