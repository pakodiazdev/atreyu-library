# TD-15 · Servicios de frontend y backend separados en Cloud Run

## Decisión

Frontend (Angular) y backend (Spring Boot) se despliegan como **servicios independientes en
Cloud Run**, resultando en 4 servicios en total: `atreyu-backend`, `atreyu-frontend`,
`atreyu-backend-qa` y `atreyu-frontend-qa`.

La alternativa considerada — un container único con nginx sirviendo el frontend estático
y actuando como reverse proxy hacia el backend — fue descartada.

## Justificación

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

## Alternativa descartada

Un container con nginx sirviendo `dist/` de Angular y haciendo `proxy_pass` al backend
en el mismo pod es el patrón clásico de un servidor web tradicional. Es válido en un
VPS o on-premise, pero en Cloud Run introduce acoplamiento innecesario y va en contra
del modelo de escalado del servicio.

## CORS

La separación implica que el frontend en producción llama al backend desde un dominio
distinto. Esto se resuelve con configuración de CORS en Spring Boot — trabajo previsto
al implementar los endpoints REST (Issue #6 en adelante).
