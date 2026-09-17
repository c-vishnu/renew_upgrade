#!/usr/bin/env bash
# One-time VM setup for auto-deploy. Run on Ubuntu/Debian as a user with sudo access.
set -euo pipefail

APP_DIR="${APP_DIR:-/projects/renew_upgrade}"
APP_USER="${APP_USER:-$(whoami)}"
REPO_URL="${REPO_URL:-https://github.com/c-vishnu/renew_upgrade.git}"

echo "==> Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git curl

echo "==> Cloning repo to ${APP_DIR}..."
sudo mkdir -p "$APP_DIR"
sudo chown "$APP_USER:$APP_USER" "$APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
npm run install:all
npm run build:prod

echo "==> Installing systemd service..."
sed "s/YOUR_USER/${APP_USER}/g" deploy/renew-upgrade.service | sudo tee /etc/systemd/system/renew-upgrade.service > /dev/null
sudo sed -i "s|/opt/renew_upgrade|${APP_DIR}|g" /etc/systemd/system/renew-upgrade.service

sudo systemctl daemon-reload
sudo systemctl enable renew-upgrade
sudo systemctl restart renew-upgrade

echo "==> Allowing passwordless service restart for deploy..."
echo "${APP_USER} ALL=(ALL) NOPASSWD: /bin/systemctl restart renew-upgrade" | sudo tee /etc/sudoers.d/renew-upgrade > /dev/null
sudo chmod 440 /etc/sudoers.d/renew-upgrade

echo "==> VM setup complete. App should be running on port 4004."
curl -f http://localhost:4004/api/health || echo "Warning: health check failed — check logs with: sudo journalctl -u renew-upgrade -f"
