#!/usr/bin/env bash

# Simple helper script to run both the Python backend (models API)
# and the Next.js + Tailwind frontend dashboard.

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Starting FastAPI backend on http://localhost:8000 ..."
cd "$ROOT_DIR"

# Activate virtualenv if it exists
if [ -d ".venv" ]; then
  # shellcheck disable=SC1091
  source ".venv/bin/activate"
fi

if command -v python &>/dev/null; then
  PYTHON_CMD="python"
elif command -v python3 &>/dev/null; then
  PYTHON_CMD="python3"
else
  echo "Error: python or python3 not found in PATH."
  exit 1
fi

$PYTHON_CMD -m uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

echo "Backend PID: $BACKEND_PID"

echo "==> Starting Next.js frontend on http://localhost:3000 ..."
cd "$ROOT_DIR/frontend"

npm install >/dev/null 2>&1 || true
npm run dev

echo "==> Shutting down backend (PID $BACKEND_PID) ..."
kill "$BACKEND_PID" 2>/dev/null || true


