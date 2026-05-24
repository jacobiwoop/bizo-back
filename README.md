# Bizo Backend

Backend API de Bizo construit avec `Laravel 11`, `Sanctum`, `MySQL`, `database queue`, `Firebase FCM` et pages de preview web.

## Documents utiles

- [API.md](./API.md) : documentation des routes HTTP, auth, payloads et comportements attendus.
- [MOBILE_INTEGRATION.md](./MOBILE_INTEGRATION.md) : guide d'integration mobile oriente client Android/iOS et IA frontend.
- [PROGRESS.md](./PROGRESS.md) : suivi d'avancement par phase.
- [bizo-backend-spec.md](./bizo-backend-spec.md) : spec technique de reference.

## Stack

- `PHP 8.3+`
- `Laravel 11`
- `MySQL`
- `Laravel Sanctum`
- `Firebase FCM HTTP v1`
- `Docker / Docker Compose`

## Demarrage rapide

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

API locale par defaut :

```txt
http://127.0.0.1:8000/api/v1
```

## Tests

Lancer toute la suite :

```bash
php artisan test
```

Lancer une suite ciblee :

```bash
php artisan test --filter=AuthTest
php artisan test --filter=ListingTest
php artisan test --filter=SocialTest
```

## Variables importantes

- `DB_*` : connexion MySQL
- `FCM_PROJECT_ID`
- `FCM_SERVICE_ACCOUNT_JSON`
- `FRONTEND_URL`
- `ANDROID_APP_PACKAGE_NAME`
- `ANDROID_APP_SHA256_CERT_FINGERPRINTS`
- `ANDROID_APP_PLAY_STORE_URL`

## Etat actuel

- Phases 1 a 7 terminees
- Phase 8 en cours
- `84 tests` valides a ce stade
