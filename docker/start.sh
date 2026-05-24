#!/bin/bash
set -e

echo "==> Bizo API - Demarrage container..."
cd /app

if [ -z "$APP_KEY" ]; then
  echo "==> Generation APP_KEY..."
  php artisan key:generate --force
fi

echo "==> Attente MySQL..."
for i in $(seq 1 15); do
  php artisan db:monitor --max=1 >/dev/null 2>&1 && break || true
  echo "   MySQL pas encore pret, attente 2s... ($i/15)"
  sleep 2
done

echo "==> Migrations..."
php artisan migrate --force --no-interaction

echo "==> Storage link..."
php artisan storage:link --force 2>/dev/null || true

echo "==> Cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

chown -R www-data:www-data storage bootstrap/cache

echo "==> Demarrage queue worker..."
php artisan queue:work --sleep=5 --tries=3 --timeout=90 --max-time=3600 &

echo "==> Demarrage scheduler..."
while true; do php artisan schedule:run --no-interaction; sleep 60; done &

echo "==> Demarrage FrankenPHP..."
exec frankenphp run --config /etc/caddy/Caddyfile
