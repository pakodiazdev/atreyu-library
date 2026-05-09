#!/bin/bash
set -e

# Ensure cleanup always runs on exit, signals or set -e early termination
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
./mvnw spring-boot:run &
SPRING_PID=$!

# Disable set -e around wait -n so EXIT_CODE is always captured before trap fires
set +e
wait -n "$ANGULAR_PID" "$SPRING_PID"
EXIT_CODE=$?
set -e

exit "$EXIT_CODE"
