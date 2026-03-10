#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONT_DIR="$ROOT_DIR/web"
BACK_DIR="$ROOT_DIR/back_python"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm не знайдено. Встанови Node.js + npm."
  exit 1
fi

PYTHON="$BACK_DIR/.venv/bin/python"
if [ ! -x "$PYTHON" ]; then
  PYTHON="python3"
fi

if ! command -v "$PYTHON" >/dev/null 2>&1; then
  echo "Python не знайдено. Встанови Python 3 або створи .venv у back_python/.venv."
  exit 1
fi

if ! "$PYTHON" -m uvicorn --version >/dev/null 2>&1; then
  echo "uvicorn не знайдено для $PYTHON."
  echo "Встанови залежності:"
  echo "  cd $BACK_DIR && $PYTHON -m pip install -r requirements.txt"
  exit 1
fi

echo "==> Starting backend at http://localhost:8000 ..."
("$PYTHON" -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000 --app-dir "$BACK_DIR") &
BACK_PID=$!

cleanup() {
  if kill -0 "$BACK_PID" >/dev/null 2>&1; then
    kill "$BACK_PID"
  fi
}
trap cleanup EXIT

echo "==> Starting frontend at http://localhost:5173 ..."
(
  cd "$FRONT_DIR"
  npm run dev
)
