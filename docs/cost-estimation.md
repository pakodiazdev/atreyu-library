# Estimación de Costos — Atreyu Library

> Este documento detalla los costos asociados a los servicios y componentes utilizados
> en el proyecto Atreyu Library, desde el ambiente de demo hasta escenarios de crecimiento.
> Todos los precios están en USD y son aproximados a mayo 2026.

---

## Componentes y costos base

### Google Cloud Run

Modelo de cobro por uso — se paga únicamente cuando hay tráfico activo.

| Recurso | Precio | Free tier mensual |
|---------|--------|------------------|
| vCPU | $0.000024 / vCPU-segundo | 180,000 vCPU-segundos |
| Memoria | $0.0000025 / GB-segundo | 360,000 GB-segundos |
| Requests | $0.40 / millón | 2,000,000 requests |

> Con scale-to-zero activo, el costo en periodos de inactividad es **$0**.

---

### Supabase (PostgreSQL)

| Plan | Costo | Límites |
|------|-------|---------|
| Free | $0 / mes | 500MB DB, 2 proyectos, 2GB bandwidth |
| Pro | $25 / mes | 8GB DB, backups diarios, sin límite de proyectos |

---

### Google Artifact Registry

Almacenamiento de imágenes Docker.

| Recurso | Precio | Free tier |
|---------|--------|-----------|
| Almacenamiento | $0.10 / GB-mes | 0.5GB |
| Egress | $0.08 / GB | — |

Para dos imágenes Docker (BE + FE) el tamaño estimado es ~300-500MB,
dentro del free tier.

---

### GitHub Actions

| Plan | Minutos incluidos | Costo adicional |
|------|------------------|-----------------|
| Free (repo público) | Ilimitados | $0 |
| Free (repo privado) | 2,000 min/mes | $0.008 / minuto extra |

---

### SonarCloud

| Plan | Costo |
|------|-------|
| Open source (repo público) | $0 |
| Privado | Desde $10 / mes |

---

### Dominio

| Dominio | Costo anual (USD) | Costo mensual equivalente (USD) |
|---------|------------------|--------------------------------|
| `pakodiaz.dev` | ~$12–15 / año | ~$1–1.25 |

> El dominio ya existe y está siendo reutilizado para este proyecto. En un proyecto
> nuevo se debería considerar este costo desde el inicio.

---

## Escenarios de costo

### Demo / MVP (actual)

Tráfico estimado: < 1,000 requests/día — dentro del free tier de todos los servicios.

| Componente | Costo mensual |
|------------|--------------|
| Cloud Run (BE + FE) | $0 |
| Supabase | $0 |
| Artifact Registry | $0 |
| GitHub Actions | $0 |
| SonarCloud | $0 |
| **Total** | **$0 / mes** |

---

### Producción ligera

Tráfico estimado: ~10,000 requests/día — supera el free tier de Cloud Run.

| Componente | Costo mensual estimado |
|------------|----------------------|
| Cloud Run BE | ~$3 |
| Cloud Run FE | ~$2 |
| Supabase Free | $0 |
| Artifact Registry | $0 |
| GitHub Actions | $0 |
| SonarCloud | $0 |
| **Total** | **~$5 / mes** |

---

### Producción con crecimiento moderado

Tráfico estimado: ~100,000 requests/día + base de datos con mayor volumen.

| Componente | Costo mensual estimado |
|------------|----------------------|
| Cloud Run BE | ~$15 |
| Cloud Run FE | ~$8 |
| Supabase Pro | $25 |
| Artifact Registry | ~$1 |
| GitHub Actions | $0 |
| SonarCloud | $0 |
| **Total** | **~$49 / mes** |

---

## Estrategia de optimización de costos

- **Scale-to-zero**: Cloud Run no cobra cuando no hay tráfico — ideal para demos
  y proyectos con tráfico irregular
- **Nginx con cache**: reduce el número de requests al contenedor del frontend,
  disminuyendo directamente el costo de Cloud Run
- **Supabase Free tier**: suficiente para el demo y etapas iniciales sin ningún costo
- **Repo público**: GitHub Actions y SonarCloud son gratuitos para proyectos open source
- **Migración progresiva**: el stack permite escalar componente por componente
  según la demanda real, sin cambios en el código

---

## Proyección por usuarios concurrentes

### Supuestos del modelo

- Cada usuario concurrente genera ~30 requests/hora (navegación, llamadas API)
- Duración promedio de request al backend: ~200ms con 0.5 vCPU y 256MB de memoria
- El frontend nginx sirve la mayoría de assets desde cache del navegador —
  solo ~20% de requests llegan al contenedor
- Tráfico activo estimado: 8 horas/día, 30 días/mes

### Tabla de proyección

| Usuarios concurrentes | Requests/mes (BE) | Cloud Run BE | Cloud Run FE | Supabase | Dominio | **Total/mes (USD)** |
|-----------------------|-------------------|-------------|-------------|----------|--------------|
| 10 | ~100K | $0 | $0 | $0 | ~$1 | **~$1** |
| 50 | ~500K | $0 | $0 | $0 | ~$1 | **~$1** |
| 100 | ~1M | $0 | $0 | $0 | ~$1 | **~$1** |
| 250 | ~2.5M | ~$2 | $0 | $0 | ~$1 | **~$3** |
| 500 | ~5M | ~$12 | ~$2 | $25 | ~$1 | **~$40** |
| 1,000 | ~10M | ~$28 | ~$4 | $25 | ~$1 | **~$58** |

> Hasta ~100 usuarios concurrentes el sistema opera completamente dentro de los
> free tiers. El salto más significativo ocurre al pasar de 250 a 500 usuarios,
> cuando Supabase Pro se vuelve recomendable por volumen de datos y conexiones.

### Desglose a 1,000 usuarios concurrentes

| Recurso | Cálculo | Costo |
|---------|---------|-------|
| vCPU-seconds BE | 10M req × 0.2s × 0.5 vCPU = 1M → descontando 180K free = 820K × $0.000024 | ~$20 |
| GB-seconds BE | 10M req × 0.2s × 0.25GB = 500K → descontando 360K free = 140K × $0.0000025 | ~$0.35 |
| Requests BE | 10M → descontando 2M free = 8M × $0.40/1M | ~$3.20 |
| Cloud Run FE | ~2M requests nginx (80% cacheadas en browser) | ~$4 |
| Supabase Pro | Plan fijo | $25 |
| Artifact Registry | ~500MB imágenes | ~$0.05 |
| **Total** | | **~$52–57/mes** |

---

## Resumen

| Escenario | Usuarios concurrentes | Costo mensual (USD) |
|-----------|----------------------|--------------|
| Demo / MVP | < 50 | ~$1 |
| Producción ligera | 100–250 | ~$1–$3 |
| Producción moderada | 500 | ~$40 |
| Producción alta | 1,000 | ~$58 |

La arquitectura elegida permite comenzar con **costo cero** y escalar de forma
progresiva y predecible hasta 1,000 usuarios concurrentes por menos de $60/mes,
sin rediseño de infraestructura.
