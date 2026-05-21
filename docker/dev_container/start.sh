#!/bin/bash
set -e

# Garantiza que el cleanup siempre se ejecuta al salir, por señales o terminación anticipada de set -e
cleanup() {
  echo "[dev] Shutting down..."
  kill "$ANGULAR_PID" "$SPRING_PID" 2>/dev/null || true
  wait "$ANGULAR_PID" "$SPRING_PID" 2>/dev/null || true
}
trap cleanup EXIT SIGTERM SIGINT

echo "[dev] Checking frontend dependencies..."
cd /workspace/code/frontend

LOCKFILE="package-lock.json"
HASH_FILE="node_modules/.lockfile-hash"
CURRENT_HASH=$(md5sum "$LOCKFILE" | cut -d' ' -f1)

if [ ! -d "node_modules" ] || [ ! -f "$HASH_FILE" ] || [ "$(cat "$HASH_FILE")" != "$CURRENT_HASH" ]; then
  echo "[dev] package-lock.json changed or node_modules missing — running npm ci..."
  npm ci --legacy-peer-deps
  echo "$CURRENT_HASH" > "$HASH_FILE"
else
  echo "[dev] Dependencies up to date — skipping npm ci."
fi

echo "[dev] Starting Angular dev server on :4200..."
npm start &
ANGULAR_PID=$!

echo "[dev] Starting Spring Boot on :8080..."
cd /workspace/code/backend
# target/ está bind-montado desde el host — archivos stale de migración/.class persisten entre reinicios y rompen Flyway.
./mvnw clean spring-boot:run &
SPRING_PID=$!

# Desactiva set -e alrededor de wait -n para capturar EXIT_CODE antes de que se dispare el trap
set +e
wait -n "$ANGULAR_PID" "$SPRING_PID"
EXIT_CODE=$?
set -e

exit "$EXIT_CODE"
