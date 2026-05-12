# syntax=docker/dockerfile:1
# Build context: repo root (.)

# Stage 1: build
FROM node:22-alpine AS builder
WORKDIR /app
COPY code/frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY code/frontend/ .
RUN npm run build

# Stage 2: production runtime
FROM nginx:stable-alpine AS prod
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Stage 3: runtime QA — agrega HTTP Basic Auth y cabeceras noindex
# Las credenciales son públicas a propósito (demo); en producción se usaría un gestor de secretos
FROM nginx:stable-alpine AS qa
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html
COPY docker/frontend/nginx-qa.conf /etc/nginx/conf.d/default.conf
RUN echo 'qa:$apr1$atreyuqa$6zCwYTr2lMX9tJZUVhQ3l1' > /etc/nginx/.htpasswd && \
    chown nginx:nginx /etc/nginx/.htpasswd && \
    chmod 640 /etc/nginx/.htpasswd
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
