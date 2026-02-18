#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONT_DIR="$ROOT_DIR/security_lab"
BACK_DIR="$ROOT_DIR/security_lab_backend"
VENV_PY="$BACK_DIR/.venv/bin/python"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm не знайдено. Встанови Node.js + npm."
  exit 1
fi

if [ ! -x "$VENV_PY" ]; then
  echo "Не знайдено $VENV_PY"
  echo "Створи віртуальне середовище у security_lab_backend/.venv і встанови залежності."
  exit 1
fi

echo "==> Building frontend..."
(
  cd "$FRONT_DIR"
  npm run build
)

echo "==> Starting backend at http://localhost:8000 ..."
exec "$VENV_PY" -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000 --app-dir "$BACK_DIR"
