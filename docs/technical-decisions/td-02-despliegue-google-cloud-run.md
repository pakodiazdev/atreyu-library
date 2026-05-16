# TD-02 · Google Cloud Run como plataforma de despliegue

## Decisión

El despliegue en cloud se realiza sobre **Google Cloud Run**.

## Justificación

Cloud Run es una plataforma serverless administrada que permite ejecutar contenedores
sin gestionar infraestructura. Para el alcance de este proyecto ofrece exactamente lo
necesario:

- **Autoscaling automático** — escala según demanda sin configuración adicional
- **Scale-to-zero** — costo cero cuando no hay tráfico, ideal para un MVP
- **Sin administración de clúster** — el foco permanece en el producto, no en la operación
- **Despliegue desde contenedores Docker** — compatible directamente con el stack definido
- **Crecimiento progresivo** — si el proyecto escala, la migración a una infraestructura
  más robusta es posible sin cambios en el código de la aplicación

## Gestión de revisiones e imágenes

Cloud Run mantiene un historial de revisiones indefinidamente y Artifact Registry
acumula imágenes por cada deploy. Para eliminar el costo de almacenamiento acumulado,
el pipeline de CD limpia automáticamente tras cada deploy exitoso:

- **Revisiones de Cloud Run** — se eliminan todas las anteriores; solo la activa permanece
- **Imágenes en Artifact Registry** — se eliminan todos los digests anteriores con sus tags

Esta política es viable porque:

- No se usa traffic splitting — todo el tráfico va siempre al 100% de la revisión activa
- El rollback se realiza redesplegando desde git, no usando revisiones o imágenes anteriores
- El historial completo está en git y cualquier versión es reconstruible desde su SHA
