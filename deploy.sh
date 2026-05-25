#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGE_NAME="${IMAGE_NAME:-bizo-back:latest}"
CONTAINER_NAME="${CONTAINER_NAME:-bizo-back}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env}"
STORAGE_DIR="${STORAGE_DIR:-/home/admin/bizo-storage}"
HOST_PORT="${HOST_PORT:-8080}"
APP_PORT="${APP_PORT:-10000}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:${HOST_PORT}/api/v1/ping}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERREUR: fichier env introuvable: $ENV_FILE" >&2
  exit 1
fi

echo "==> Dossier application..."
echo "$APP_DIR"

echo "==> Mise a jour du code..."
cd "$APP_DIR"
git pull origin main

echo "==> Build image Docker..."
sudo docker build -t "$IMAGE_NAME" .

echo "==> Suppression ancien conteneur..."
sudo docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

echo "==> Creation dossier storage..."
mkdir -p "$STORAGE_DIR"

echo "==> Demarrage nouveau conteneur..."
sudo docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --env-file "$ENV_FILE" \
  -e PORT="$APP_PORT" \
  -e RUN_MIGRATIONS=true \
  -e RUN_QUEUE=true \
  -e RUN_SCHEDULER=true \
  -e WAIT_FOR_DB=true \
  -p "127.0.0.1:${HOST_PORT}:${APP_PORT}" \
  -v "$STORAGE_DIR:/app/storage" \
  "$IMAGE_NAME"

echo "==> Etat du conteneur..."
sudo docker ps --filter "name=$CONTAINER_NAME"

echo "==> Attente du ping local..."
for _ in $(seq 1 30); do
  if curl -fsS "$HEALTH_URL" >/dev/null; then
    curl -sS "$HEALTH_URL"
    echo
    break
  fi
  sleep 2
done

if ! curl -fsS "$HEALTH_URL" >/dev/null; then
  echo "ERREUR: le service ne repond pas sur $HEALTH_URL" >&2
  echo
  echo "==> Logs recents..."
  sudo docker logs --tail=120 "$CONTAINER_NAME" || true
  exit 1
fi

if systemctl is-active --quiet nginx; then
  echo "==> Reload nginx..."
  sudo systemctl reload nginx
fi

echo
echo "==> Logs recents..."
sudo docker logs --tail=50 "$CONTAINER_NAME"
