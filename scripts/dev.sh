#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
TASK_PIDS=()
cleanup() {
  for TASK_PID in "${TASK_PIDS[@]}"; do kill "$TASK_PID" 2>/dev/null || true; done
}
trap cleanup EXIT INT TERM
.venv/bin/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 &
TASK_PIDS+=("$!")
.venv/bin/python -m backend.worker.scan &
TASK_PIDS+=("$!")
npm --prefix frontend run dev &
TASK_PIDS+=("$!")
echo 'Frontend: http://localhost:5173   API: http://localhost:8000/docs'
wait
