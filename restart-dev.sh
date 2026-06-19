#!/usr/bin/env bash
# Restarts Postgres, the backend API (port 4000), and the frontend (port 5173).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_LOG=/tmp/backend.log
FRONTEND_LOG=/tmp/frontend.log

echo "== Stopping any existing dev servers on 4000/5173 =="
pkill -f "ts-node-dev.*src/index.ts" 2>/dev/null || true
pkill -f "vite --host" 2>/dev/null || true
sleep 1

echo "== Starting Postgres =="
service postgresql start
for i in $(seq 1 10); do
  pg_isready >/dev/null 2>&1 && break
  sleep 1
done
pg_isready

echo "== Running migrations =="
(cd "$BACKEND_DIR" && npm run migrate:up)

echo "== Seeding database =="
(cd "$BACKEND_DIR" && npm run seed)

echo "== Starting backend (port 4000) =="
(cd "$BACKEND_DIR" && nohup npm run dev > "$BACKEND_LOG" 2>&1 &)
sleep 5
tail -n 10 "$BACKEND_LOG"

echo "== Starting frontend (port 5173) =="
(cd "$FRONTEND_DIR" && nohup npx vite --host 0.0.0.0 --port 5173 > "$FRONTEND_LOG" 2>&1 &)
sleep 5
tail -n 10 "$FRONTEND_LOG"

echo "== Health check =="
curl -s -o /dev/null -w "backend (4000):  %{http_code}\n" http://localhost:4000/api-docs || true
curl -s -o /dev/null -w "frontend (5173): %{http_code}\n" http://localhost:5173/ || true

echo
echo "Done. Logs: $BACKEND_LOG / $FRONTEND_LOG"
echo "Login with: admin@fleet.test / Password@123"
