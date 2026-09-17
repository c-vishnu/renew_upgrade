#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

npm run install:all
npm run build:prod
sudo systemctl restart renew-upgrade
curl -f http://localhost:4004/api/health

echo "Deploy complete."
