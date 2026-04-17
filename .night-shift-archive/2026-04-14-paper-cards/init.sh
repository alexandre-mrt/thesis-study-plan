#!/bin/bash
# Night shift init — thesis study plan (pure HTML/CSS/JS, no build)
set -e

cd "$(dirname "$0")"

echo "=== Thesis Study Plan — Night Shift Init ==="
echo "Branch: $(git branch --show-current)"
echo "Files: $(ls *.js *.css *.html 2>/dev/null | wc -l | tr -d ' ') source files"
echo "=== Ready (no build step needed) ==="
