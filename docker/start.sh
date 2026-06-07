#!/bin/bash
set -e

echo "==> Bizo API - Demarrage container..."
cd /app

APP_PORT="${PORT:-10000}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-true}"
RUN_QUEUE="${RUN_QUEUE:-true}"
RUN_SCHEDULER="${RUN_SCHEDULER:-true}"
RUN_REVERB="${RUN_REVERB:-true}"
WAIT_FOR_DB="${WAIT_FOR_DB:-true}"

if [ -z "$APP_KEY" ]; then
  echo "==> Generation APP_KEY..."
  php artisan key:generate --force
fi

if [ "$WAIT_FOR_DB" = "true" ]; then
  echo "==> Attente MySQL..."
  for i in $(seq 1 30); do
    php artisan migrate:status >/dev/null 2>&1 && break || true
    echo "   MySQL pas encore pret, attente 2s... ($i/30)"
    sleep 2
  done
fi

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "==> Migrations..."
  php artisan migrate --force --no-interaction
fi

echo "==> Preparation storage..."
mkdir -p \
  storage/app/public \
  storage/framework/cache \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache

echo "==> Storage link..."
php artisan storage:link --force 2>/dev/null || true

echo "==> Cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache || true

chown -R www-data:www-data storage bootstrap/cache

if [ "$RUN_QUEUE" = "true" ]; then
  echo "==> Demarrage queue worker..."
  while true; do
    php artisan queue:work --sleep=5 --tries=3 --timeout=90 --max-time=3600
    echo "==> Queue worker arrete, redemarrage dans 2s..."
    sleep 2
  done &
fi

if [ "$RUN_SCHEDULER" = "true" ]; then
  echo "==> Demarrage scheduler..."
  while true; do php artisan schedule:run --no-interaction; sleep 60; done &
fi

if [ "$RUN_REVERB" = "true" ]; then
  echo "==> Demarrage Reverb..."
  php artisan reverb:start \
    --host="${REVERB_SERVER_HOST:-0.0.0.0}" \
    --port="${REVERB_SERVER_PORT:-8080}" \
    --hostname="${REVERB_HOST:-localhost}" \
    --path="${REVERB_SERVER_PATH:-}" \
    --no-interaction &
fi

echo "==> Demarrage FrankenPHP sur le port ${APP_PORT}..."
exec frankenphp run --config /etc/caddy/Caddyfile
