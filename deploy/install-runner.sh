#!/usr/bin/env bash
# Install GitHub Actions self-hosted runner on the VM.
# Get a registration token first: GitHub repo → Settings → Actions → Runners → New self-hosted runner
set -euo pipefail

RUNNER_VERSION="${RUNNER_VERSION:-2.321.0}"
RUNNER_DIR="${RUNNER_DIR:-$HOME/actions-runner}"
REPO_URL="${REPO_URL:-https://github.com/c-vishnu/renew_upgrade}"
RUNNER_TOKEN=AY4S3M2KT5MPPJUCL75QVTLKVO3VQ

if [ -z "${RUNNER_TOKEN:-}" ]; then
  echo "Error: set RUNNER_TOKEN from GitHub (Settings → Actions → Runners → New self-hosted runner)."
  echo "Example: RUNNER_TOKEN=XXXX ./deploy/install-runner.sh"
  exit 1
fi

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

if [ ! -f ./config.sh ]; then
  curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L \
    "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
  tar xzf "./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
fi

./config.sh --url "$REPO_URL" --token "$RUNNER_TOKEN" --unattended

sudo ./svc.sh install
sudo ./svc.sh start

echo "Self-hosted runner installed. Check status in GitHub → Settings → Actions → Runners."
