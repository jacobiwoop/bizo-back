# Bizo Server Operations Agent Guide

## Purpose

This file gives an agent enough operational context to work autonomously without guessing the server setup.

Use it for:

- backend deployment checks
- SSH access
- production health checks
- Docker diagnostics
- mobile APK build/deploy workflow
- quick recovery tips

Do not put private secrets in commits. Reference local secret paths only.

## Production Overview

- Production API: `https://bizo.aiko.qzz.io/api/v1`
- Health endpoint: `https://bizo.aiko.qzz.io/api/v1/ping`
- Server IP: `204.236.198.29`
- SSH user: `admin`
- SSH key on this machine: `/home/aiko/aws/mood.pem`
- Server repo path: `/home/admin/apps/bizo-back`
- Persistent storage path: `/home/admin/bizo-storage`
- Mobile APK output path: `/home/admin/bizo-storage/mobile-builds`

The backend is a Laravel API served from Docker using FrankenPHP/Caddy.

The mobile app is a separate Expo React Native project inside:

```txt
/home/aiko/Documents/bizo-back/bizo-mobile-rn
```

## SSH

Connect to the server:

```bash
ssh -i /home/aiko/aws/mood.pem admin@204.236.198.29
```

Then:

```bash
cd /home/admin/apps/bizo-back
```

If SSH fails, check:

- key path exists locally
- key permissions are not too open
- server is reachable
- IP has not changed

Useful local check:

```bash
curl -I https://bizo.aiko.qzz.io/api/v1/ping
```

## Backend Container Architecture

Main production deployment script:

```txt
deploy.sh
```

The script:

- pulls `origin main`
- builds Docker image `bizo-back:latest`
- replaces container `bizo-back`
- mounts `/home/admin/bizo-storage` to `/app/storage`
- exposes app internally on port `10000`
- binds host port `8080` locally as `127.0.0.1:8080`
- runs migrations on startup
- runs queue worker
- runs scheduler
- starts Reverb
- reloads nginx if active

Container name:

```txt
bizo-back
```

Backend Docker image:

```txt
bizo-back:latest
```

The container starts through:

```txt
docker/start.sh
```

Important runtime services inside the container:

- FrankenPHP serves Laravel
- Laravel queue worker runs in background
- Laravel scheduler runs every minute
- Laravel Reverb runs in background

## Backend Deploy Workflow

Normal safe backend deploy from the server:

```bash
cd /home/admin/apps/bizo-back
./deploy.sh
```

If the agent changes backend code locally:

```bash
git status
git add <changed-files>
git commit -m "Short clear message"
git push origin main
```

Then on the server:

```bash
ssh -i /home/aiko/aws/mood.pem admin@204.236.198.29
cd /home/admin/apps/bizo-back
./deploy.sh
```

Important: do not assume backend production auto-deploys from GitHub unless that automation is explicitly verified. The known reliable production deployment path is `git push` then server `./deploy.sh`.

## Mobile Build Workflow

Preferred debug APK build path:

```txt
GitHub Actions -> Expo Android Debug
```

The workflow is:

```txt
.github/workflows/expo-android-debug.yml
```

It runs on:

- manual `workflow_dispatch`
- push to `main` when files under `bizo-mobile-rn/**` change
- push to the workflow file itself

For mobile app changes:

```bash
git status
git add <changed-files>
git commit -m "Short clear message"
git push origin main
```

After push, GitHub Actions should build the debug APK artifact.

Server-side Expo Android builds are possible but heavy. Prefer GitHub Actions unless the human operator explicitly asks for a server build.

Server-side build command:

```bash
cd /home/admin/apps/bizo-back
OUTPUT_DIR=/home/admin/bizo-storage/mobile-builds bash ./scripts/build-mobile-expo-apk.sh
```

Force rebuild of the Android builder image only if necessary:

```bash
cd /home/admin/apps/bizo-back
FORCE_REBUILD_IMAGE=1 OUTPUT_DIR=/home/admin/bizo-storage/mobile-builds bash ./scripts/build-mobile-expo-apk.sh
```

Known issue: Expo native builds can consume a lot of RAM, swap, disk, and CPU. Avoid repeating them on the server while the backend is serving traffic.

## Local Mobile Environment

For local mobile development:

```bash
cd /home/aiko/Documents/bizo-back/bizo-mobile-rn
nvm use v20.19.6
npm run typecheck
```

Do not use Node 22 for local Expo development on this project.

The human operator normally starts Metro manually. Do not run this unless explicitly asked:

```bash
npx expo start --dev-client --clear
```

## Quick Production Checks

From local machine:

```bash
curl -sS https://bizo.aiko.qzz.io/api/v1/ping
```

From server:

```bash
curl -sS http://127.0.0.1:8080/api/v1/ping
```

Docker status:

```bash
sudo docker ps
sudo docker logs --tail=120 bizo-back
```

Container shell:

```bash
sudo docker exec -it bizo-back sh
```

Laravel logs:

```bash
sudo docker exec bizo-back sh -lc 'tail -n 120 storage/logs/laravel.log'
```

Laravel route check:

```bash
sudo docker exec bizo-back php artisan route:list
```

Queue/database status:

```bash
sudo docker exec bizo-back php artisan migrate:status
```

Nginx status:

```bash
sudo systemctl status nginx --no-pager
sudo nginx -t
```

Resource pressure:

```bash
free -h
df -h
sudo docker system df
```

Find large server directories:

```bash
sudo du -h --max-depth=1 /home/admin | sort -h
sudo du -h --max-depth=1 /home/admin/bizo-storage | sort -h
sudo du -h --max-depth=1 /var/lib/docker | sort -h
```

## Server Saturation Tips

If the server becomes slow or unavailable during mobile build:

- check `free -h`
- check `df -h`
- check `sudo docker ps`
- check `sudo docker logs --tail=120 bizo-back`
- avoid launching another Expo Android native build
- prefer GitHub Actions for APK builds

Do not run destructive cleanup blindly.

Safe informational Docker checks:

```bash
sudo docker system df
sudo docker image ls
sudo docker container ls -a
```

Cleanup needs human confirmation if it removes images, containers, volumes, or caches.

## Git Rules For Agents

Before committing:

```bash
git status
git diff -- <files-you-changed>
```

For React Native changes:

```bash
cd /home/aiko/Documents/bizo-back/bizo-mobile-rn
nvm use v20.19.6
npm run typecheck
```

Commit only your own changes. Do not revert unrelated user changes.

Push command:

```bash
git push origin main
```

Effects of push:

- mobile changes under `bizo-mobile-rn/**` trigger GitHub Actions debug APK build
- backend production still needs server deployment through `./deploy.sh` unless auto-deploy has been explicitly verified

## Backend API Reference

Main mobile API contract:

```txt
MOBILE_INTEGRATION.md
```

Backend routes:

```txt
routes/api.php
```

Primary API base URL in mobile app:

```txt
bizo-mobile-rn/src/config/env.ts
```

Axios client:

```txt
bizo-mobile-rn/src/lib/api/client.ts
```

Session store:

```txt
bizo-mobile-rn/src/store/session.ts
```

## Design Reference

Current active mobile design source:

```txt
bizo-mobile-rn/design/bizo
```

Do not use `design-reference/classified-ai` as the active source unless explicitly requested.

## Agent Decision Rules

- If a task is UI-only, do not touch backend deploy files.
- If a task is backend connection, use `MOBILE_INTEGRATION.md` first.
- If backend data forces UI changes, report the UI change and why.
- If a server command can affect production, explain it before running it.
- If a command can delete Docker data, images, volumes, APKs, or cache, ask first.
- Prefer GitHub Actions for mobile native builds.
- Prefer `./deploy.sh` for production backend deploy.
