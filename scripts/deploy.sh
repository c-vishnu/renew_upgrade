#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

git config --global --add safe.directory "$ROOT"
git fetch origin main
git reset --hard origin/main

npm run install:all
npm run build:prod
sudo -n /bin/systemctl restart renew-upgrade

for i in 1 2 3 4 5; do
  sleep 2
  if curl -fsS http://localhost:4004/api/health; then
    echo ""
    echo "Deploy complete."
    exit 0
  fi
  echo "Waiting for app to start (attempt $i/5)..."
done

echo "Health check failed"
sudo systemctl status renew-upgrade --no-pager || true
exit 1
