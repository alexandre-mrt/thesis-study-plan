#!/usr/bin/env bash
# Bootstrap script re-used by every night-shift iteration.
# thesis-study-plan is a zero-build static site: no deps, no build, no test suite.

set -euo pipefail
cd "$(dirname "$0")"

echo "[init] thesis-study-plan bootstrap"

if ! command -v python3 >/dev/null 2>&1; then
  echo "[init] python3 not found — needed for local server" >&2
  exit 1
fi

# Kill any stale server on 8765
if lsof -ti :8765 >/dev/null 2>&1; then
  echo "[init] stopping previous local server on :8765"
  kill $(lsof -ti :8765) 2>/dev/null || true
  sleep 1
fi

echo "[init] no build step required (vanilla HTML/CSS/JS)"
echo "[init] to serve locally: python3 -m http.server 8765"
echo "[init] ready"
