#!/bin/bash
# deploy.sh — commits the freshly generated index.html and pushes to GitHub Pages
# Runs automatically after generate-report.js

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

if [ ! -f index.html ]; then
  echo "deploy.sh: index.html not found — skipping deploy" >&2
  exit 1
fi

# Stage only the report file
git add index.html

# Only commit if something changed
if git diff --cached --quiet; then
  echo "deploy.sh: index.html unchanged — nothing to push"
  exit 0
fi

DATE=$(date '+%Y-%m-%d')
git commit -m "report: ${DATE}"
git push origin master

echo "deploy.sh: pushed report for ${DATE}"
