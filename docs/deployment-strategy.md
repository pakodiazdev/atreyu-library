# Estrategia de Despliegue — Atreyu Library

> Este documento describe la estrategia de despliegue del proyecto Atreyu Library,
> los ambientes disponibles, el flujo de promoción entre ellos y la configuración
> de dominios y contenedores en cada etapa.

---

## Ambientes

| Ambiente | URL | Trigger | Rama |
|----------|-----|---------|------|
| Local | `localhost` | Manual — `docker compose up` | Cualquier rama |
| QA | `qa01.atreyu-library.pakodiaz.dev` | Manual — GitHub Actions | Cualquier rama |
| Producción | `atreyu-library.pakodiaz.dev` | Automático — merge a `main` | `main` |

---

## Flujo de promoción

```
 Developer
     │
     │  1. Desarrolla en rama local
     ▼
 Local (docker compose)
     │
     │  2. Valida en QA antes de abrir PR
     ▼
 QA (deploy manual por branch)
     │
     │  3. Abre PR → CI pasa → reviews aprobadas
     ▼
 Merge a main
     │
     │  4. CD despliega automáticamente
     ▼
 Producción (Cloud Run)
```

---

## Local

El ambiente local corre sobre Docker Compose con dos contenedores:

| Contenedor | Contenido | Puerto (default) |
|------------|-----------|-----------------|
| `dev_container` | Spring Boot (BE) + Angular dev server (FE) | `8080` / `4200` |
| `postgres` | PostgreSQL | `5432` |

- El frontend corre con `ng serve` — hot reload activo
- El backend corre con Spring Boot DevTools — restart automático
- Se incluye configuración de **devcontainer** para VS Code y JetBrains
- Cypress se ejecuta de forma nativa en la máquina local, apuntando a `localhost`

### Puertos configurables por `.env`

Los puertos expuestos se configuran mediante un archivo `.env` en la raíz del proyecto,
lo que permite levantar **múltiples instancias simultáneas** en el mismo equipo. Esto
es especialmente útil cuando diferentes agentes trabajan en paralelo sobre distintos
issues o módulos.

```env
# .env
BE_PORT=8080
FE_PORT=4200
DB_PORT=5432
```

Para levantar una segunda instancia en puertos distintos basta con usar un `.env`
diferente o sobreescribir las variables al invocar Docker Compose:

```bash
BE_PORT=8081 FE_PORT=4201 DB_PORT=5433 docker compose up
```

> `.env` está en `.gitignore` — el repositorio incluye un `.env.example` con los
> valores por defecto como referencia.

---

## QA

Ambiente de validación previo al PR. Se despliega manualmente desde GitHub Actions
seleccionando el branch a probar.

**Infraestructura:**

| Componente | Configuración |
|------------|--------------|
| Backend | Cloud Run — imagen Docker del branch seleccionado |
| Frontend | Cloud Run — imagen nginx con build de producción del branch |
| Base de datos | Supabase — instancia compartida con producción (datos de prueba vía seeder) |
| Dominio | `qa01.atreyu-library.pakodiaz.dev` |

> El prefijo `qa01` permite escalar a múltiples ambientes simultáneos (`qa02`, `qa03`)
> si se necesita validar más de un branch en paralelo.

**Imágenes Docker en QA y producción:**

```
backend/
└── Dockerfile          → multi-stage build
    ├── Stage 1: build  → Maven compila el JAR
    └── Stage 2: run    → JRE mínimo + JAR

frontend/
└── Dockerfile          → multi-stage build
    ├── Stage 1a: deps       → npm ci (base compartida)
    ├── Stage 1b: builder-prod → ng build --configuration=production
    ├── Stage 1c: builder-qa   → ng build --configuration=qa
    ├── Stage 2: prod   → nginx sirve los estáticos de builder-prod
    └── Stage 3: qa     → nginx sirve los estáticos de builder-qa + HTTP Basic Auth (demo)
```

**URL de la API — baked en el build de Angular:**

El frontend usa URLs absolutas configuradas en los archivos de entorno de Angular:

| Entorno | Archivo | `apiUrl` |
|---------|---------|----------|
| Local | `environment.ts` | `http://localhost:8080/api/v1` |
| QA | `environment.qa.ts` | `https://api-qa01.atreyu-library.pakodiaz.dev/api/v1` |
| Producción | `environment.prod.ts` | `https://api.atreyu-library.pakodiaz.dev/api/v1` |

El build de Angular selecciona el archivo correcto mediante `fileReplacements` en `angular.json`
según la configuración (`--configuration=production` / `--configuration=qa`).

Las llamadas son **cross-origin** (frontend y backend en dominios distintos). El backend
gestiona CORS en `application-prod.properties` y `application-qa.properties` permitiendo
explícitamente el origen del frontend correspondiente.

---

## Producción

Ambiente principal. Se despliega automáticamente al hacer merge a `main`.

**Infraestructura:**

| Componente | Configuración |
|------------|--------------|
| Backend | Cloud Run — imagen Docker desde `main` |
| Frontend | Cloud Run — imagen nginx desde `main` |
| Base de datos | Supabase — instancia de producción |
| Dominio | `atreyu-library.pakodiaz.dev` |
| Registry | Google Artifact Registry |

**Configuración de nginx (frontend):**

```nginx
location ~* \.(js|css|png|jpg|svg|ico|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

Angular genera hashes en los nombres de archivo en cada build (`main.abc123.js`),
lo que garantiza que el cache agresivo no sirva versiones desactualizadas al usuario.

---

## Variables de entorno

Las variables sensibles se gestionan como **secrets en GitHub Actions** y se inyectan
en Cloud Run como variables de entorno en tiempo de despliegue. Nunca se almacenan
en el repositorio.

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Connection string de Supabase |
| `DATABASE_USERNAME` | Usuario de base de datos |
| `DATABASE_PASSWORD` | Contraseña de base de datos |
| `GCP_PROJECT_ID` | ID del proyecto en Google Cloud |
| `GCP_SA_KEY` | Service account key para autenticación con GCP |
| `CLOUD_RUN_REGION` | Región de despliegue (ej. `us-central1`) |

> La URL de la API del backend **no se gestiona como secret** — está baked en el build
> de Angular a través de los archivos de entorno (`environment.prod.ts`, `environment.qa.ts`).
> Los dominios son estables y están documentados en la sección de cada ambiente.

---

## Rollback

En caso de fallo en producción, Cloud Run permite revertir a una revisión anterior
desde la consola de GCP o mediante el CLI con un solo comando:

```bash
gcloud run services update-traffic atreyu-library-backend \
  --to-revisions REVISION_ID=100
```

Esto hace el rollback instantáneo sin necesidad de un nuevo despliegue.
