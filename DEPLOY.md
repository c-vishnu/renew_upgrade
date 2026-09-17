# Deploy to local VM (auto-deploy on push)

Every push to `main` triggers a GitHub Actions workflow that builds and restarts the app on your VM via a self-hosted runner.

## One-time VM setup

SSH into your VM and run:

```bash
git clone https://github.com/c-vishnu/renew_upgrade.git /opt/renew_upgrade
cd /opt/renew_upgrade
chmod +x deploy/vm-setup.sh scripts/deploy.sh
./deploy/vm-setup.sh
```

This installs Node 20, builds the app, creates the `renew-upgrade` systemd service, and configures passwordless restart for deploys.

Verify: open `http://<VM-IP>:4004` or run `curl http://localhost:4004/api/health`.

### Optional: nginx reverse proxy

Copy [deploy/nginx.conf](deploy/nginx.conf) to `/etc/nginx/sites-available/renew-upgrade`, update `server_name`, then:

```bash
sudo ln -s /etc/nginx/sites-available/renew-upgrade /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Install self-hosted GitHub Actions runner

1. Go to **GitHub → c-vishnu/renew_upgrade → Settings → Actions → Runners → New self-hosted runner**
2. Copy the registration token
3. On the VM:

```bash
cd /opt/renew_upgrade
RUNNER_TOKEN=<paste-token-here> ./deploy/install-runner.sh
```

The runner must show as **Idle** in GitHub before auto-deploy will work.

## Manual deploy

```bash
cd /opt/renew_upgrade
./scripts/deploy.sh
```

## How auto-deploy works

1. Push to `main` on GitHub
2. Workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs on the self-hosted runner
3. Steps: checkout → `npm run install:all` → `npm run build:prod` → `systemctl restart renew-upgrade` → health check

## Troubleshooting

| Issue | Fix |
| --- | --- |
| Workflow queued forever | Runner not installed or offline — check Settings → Actions → Runners |
| `systemctl restart` permission denied | Re-run `./deploy/vm-setup.sh` or add sudoers rule from [deploy/vm-setup.sh](deploy/vm-setup.sh) |
| App not loading UI | Run `npm run build:prod` — production serves from `client/dist` |
| View logs | `sudo journalctl -u renew-upgrade -f` |
