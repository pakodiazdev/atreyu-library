# Escalabilidad — Atreyu Library

> Este documento describe la estrategia de escalabilidad del proyecto Atreyu Library,
> desde su arquitectura MVP hasta su potencial de crecimiento progresivo sin cambios
> estructurales en el código.

---

## Filosofía

La arquitectura está diseñada para comenzar simple y escalar progresivamente.
Cada decisión técnica tomada en el MVP considera el crecimiento futuro sin
sobreingeniería en la etapa inicial.

---

## Escalabilidad por capa

### Frontend — Google Cloud Run

Cloud Run escala automáticamente el número de instancias del contenedor Angular
según el tráfico entrante.

- **Scale-to-zero**: sin tráfico, el costo es cero
- **Autoscaling horizontal**: Cloud Run levanta nuevas instancias en milisegundos
  ante picos de demanda
- **Cold starts**: el único tradeoff del scale-to-zero es la latencia en la primera
  request tras un periodo de inactividad. Para un MVP esto es aceptable; en producción
  se puede configurar un mínimo de instancias activas para eliminarlo
- **Nginx con cache de archivos estáticos** *(QA y producción)*: en estos ambientes
  el frontend se sirve mediante una imagen nginx configurada con headers de cache
  agresivos para JS, CSS e imágenes generados por el build de Angular. Esto reduce
  drásticamente las requests al contenedor — el navegador sirve los assets desde su
  cache local en visitas subsecuentes, disminuyendo la carga en Cloud Run y los
  costos de egress. En local este paso no aplica — el frontend corre con el dev
  server de Angular dentro del `dev_container`

### Backend — Google Cloud Run

Misma estrategia que el frontend. La API de Spring Boot corre en contenedor y escala
horizontalmente sin configuración adicional.

- Las instancias son **stateless** — no guardan estado en memoria entre requests,
  lo que hace el escalado horizontal transparente
- Si la carga crece significativamente, se puede ajustar la concurrencia por instancia
  y el número máximo de instancias directamente en la configuración de Cloud Run

### Base de datos — PostgreSQL / Supabase

La base de datos es el componente con mayor riesgo de convertirse en bottleneck
a medida que crece el volumen de datos y requests.

**Estrategia actual (MVP):**
- Supabase free tier — suficiente para el demo y etapas iniciales
- Índice único en `code` para búsquedas eficientes
- ULID como PK garantiza inserciones sin colisiones y sin locks de secuencia

**Ruta de escalabilidad:**
| Etapa | Acción | Impacto en código |
|-------|--------|-------------------|
| Crecimiento moderado | Migrar a Supabase Pro o Cloud SQL | Solo connection string |
| Alto volumen de lectura | Agregar réplicas de lectura | Configuración en Spring datasource |
| Alto volumen de escritura | Particionado de tablas | Migración Flyway |
| Escala masiva | Migrar a arquitectura de microservicios | Refactor mayor |

---

## Escalabilidad del modelo de negocio

### El código de negocio no limita el crecimiento

El identificador visible `code` (A-Z + 00-99) tiene 2,600 combinaciones posibles.
Esta limitación es de **negocio**, no técnica. La arquitectura la absorbe sin impacto:

- La PK real es el ULID — sin límite práctico de registros
- Si el cliente decide ampliar el espacio (ej. dos letras + tres dígitos),
  el único cambio es una nueva migración Flyway que añada los nuevos códigos al pool
  con `ON CONFLICT DO NOTHING` — sin cambios en endpoints, sin cambios en el frontend

---

## Estrategia de despliegue progresivo

```
MVP (actual)
├── Cloud Run — BE + FE
├── Supabase — PostgreSQL
└── GitHub Actions — CI/CD

Crecimiento moderado
├── Cloud Run — BE + FE (min instances configuradas)
├── Cloud SQL — PostgreSQL administrado en GCP
└── GitHub Actions — CI/CD

Escala alta
├── Cloud Run — múltiples servicios
├── Cloud SQL — réplicas de lectura
├── Cloud CDN — assets estáticos del frontend
└── Cloud Armor — protección y rate limiting
```

---

## Lo que NO escala en el MVP (y cómo resolverlo)

| Limitación actual | Solución futura |
|-------------------|-----------------|
| Sin paginación en lista de libros | `Pageable` en Spring Data JPA |
| Sin caché de API | Redis / Cloud Memorystore |
| Sin CDN para el frontend | Cloud CDN o Firebase Hosting |
| Sin rate limiting | Cloud Armor o API Gateway |
| Base de datos single-node | Réplicas de lectura en Cloud SQL |
