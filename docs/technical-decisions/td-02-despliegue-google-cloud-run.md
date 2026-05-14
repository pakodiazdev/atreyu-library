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
