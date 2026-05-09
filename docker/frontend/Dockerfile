# syntax=docker/dockerfile:1
# Build context: repo root (.)

# Stage 1: build
FROM node:22-alpine AS builder
WORKDIR /app
COPY code/frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY code/frontend/ .
RUN npm run build

# Stage 2: runtime
FROM nginx:stable-alpine
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
