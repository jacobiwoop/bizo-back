# Bizo API

Documentation pratique du backend Bizo, alignee sur les routes et tests reels du repo.

Base URL :

```txt
/api/v1
```

## Conventions

- Authentification API : `Authorization: Bearer <token>`
- Format standard : JSON
- Upload fichiers : `multipart/form-data`
- Pagination Laravel : la plupart des listes renvoient `data`, `links`, `meta`
- Rate limit API : `120 req/min` en usage normal
- CORS : actif sur `api/*` et `sanctum/csrf-cookie`

## Health

### `GET /ping`

Retourne l'etat du service.

Exemple :

```json
{
  "status": "ok",
  "service": "BizoAPI"
}
```

## Auth

### `POST /auth/register`

Body JSON :

```json
{
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "display_name": "Aiko",
  "username": "aiko_dev"
}
```

Reponse `201` :

```json
{
  "token": "plain-text-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "Aiko",
    "username": "aiko_dev",
    "photo_url": null
  }
}
```

### `POST /auth/login`

Body JSON :

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Reponses :

- `200` avec `token` et `user`
- `401` avec `{"message":"Identifiants incorrects"}`

### `POST /auth/logout`

Auth requise. Supprime le token courant quand il existe.

### `POST /auth/password/reset`

Demande un lien de reinitialisation.

Body JSON :

```json
{
  "email": "user@example.com"
}
```

Reponse `200` toujours generique :

```json
{
  "message": "Si ce compte existe, un lien de réinitialisation a été envoyé par email."
}
```

### `POST /auth/password/update`

Body JSON :

```json
{
  "email": "user@example.com",
  "token": "reset-token",
  "password": "new-password-123",
  "password_confirmation": "new-password-123"
}
```

### `POST /auth/fcm-token`

Auth requise. Met a jour le token FCM du device.

Body JSON :

```json
{
  "fcm_token": "device-token"
}
```

## Profil

### `GET /me`

Alias auth du profil courant.

### `GET /profile`

Retourne le profil de l'utilisateur connecte.

### `PUT /profile`

Auth requise.

Champs supportes :

- `display_name`
- `username`
- `bio`
- `country_code`
- `is_profile_public`
- `has_seen_onboarding`
- `notif_messages`
- `notif_troc`
- `notif_rappels`
- `notif_favoris`

Exemple :

```json
{
  "display_name": "Nouveau Nom",
  "username": "new_handle",
  "bio": "Bio publique",
  "notif_messages": false
}
```

### `POST /profile/avatar`

Auth requise, `multipart/form-data`.

Champ :

- `avatar` : image `jpg|jpeg|png|webp`, max `5 Mo`

### `DELETE /profile`

Auth requise. Revoque les tokens API et supprime le compte par soft delete.

### `GET /users/{uid}`

Retourne un profil vendeur public uniquement.

### `GET /users/{uid}/listings`

Retourne uniquement les annonces actives d'un vendeur public.

## Listings

### `GET /listings`

Feed principal.

Filtres supportes :

- `per_page`
- `category`
- `type`
- `condition`
- `country`
- `city`
- `min_price`
- `max_price`

### `POST /listings`

Auth requise, `multipart/form-data`.

Champs principaux :

- `title`
- `description`
- `type` : `VENTE|TROC|TROC_CASH`
- `price` requis pour `VENTE`
- `exchange_for` requis pour `TROC|TROC_CASH`
- `category`
- `condition`
- `delivery_mode`
- `country`
- `city`
- `neighborhood`
- `tags[]`
- `photos[]` : min `1`, max `10`

### `GET /listings/{id}`

Retourne le detail d'une annonce et incremente `view_count`.

### `PUT /listings/{id}`

Auth requise, proprietaire uniquement.

Mise a jour partielle supportee.

### `DELETE /listings/{id}`

Auth requise, proprietaire uniquement.

L'annonce est passee en `deleted`, puis soft-deleted.

### `POST /listings/{id}/photos`

Ajoute des photos a une annonce, sans depasser `10` photos au total.

### `DELETE /listings/{id}/photos/{idx}`

Supprime une photo par index.

### `POST /listings/{id}/boost`

Booste une annonce active.

### `POST /listings/{id}/renew`

Renouvelle une annonce expiree.

### `GET /listings/{id}/similar`

Retourne des annonces similaires.

### `GET /my/listings`

Auth requise. Retourne les annonces du compte courant.

## Conversations et messages

### `GET /conversations`

Auth requise. Liste les conversations du compte.

### `POST /conversations`

Auth requise.

Exemple :

```json
{
  "listing_id": "uuid",
  "text": "Bonsoir, est-ce disponible ?"
}
```

### `GET /conversations/{id}/messages`

Auth requise. Liste les messages d'une conversation.

### `POST /conversations/{id}/messages`

Auth requise.

Exemple :

```json
{
  "text": "Toujours disponible ?"
}
```

### `POST /conversations/{id}/read`

Auth requise. Marque la conversation comme lue pour le participant courant.

## Transactions, reviews, favoris

### `POST /transactions`

Auth requise. Cree une transaction depuis une annonce, par le vendeur.

### `POST /reviews`

Auth requise. Cree un avis sur une transaction et recalcule `rating` / `review_count`.

Exemple :

```json
{
  "transaction_id": "uuid",
  "listing_id": "uuid",
  "rating": 5,
  "comment": "Transaction parfaite",
  "from_uid": "buyer-uuid",
  "to_uid": "seller-uuid"
}
```

### `GET /favorites`

Auth requise. Liste les favoris courants.

### `POST /favorites/{listingId}`

Auth requise. Ajoute un favori.

### `DELETE /favorites/{listingId}`

Auth requise. Retire un favori.

## Notifications

### `GET /notifications`

Auth requise. Liste les notifications du compte.

Exemple de ressource :

```json
{
  "id": "uuid",
  "type": "new_message",
  "title": "Nouveau message",
  "body": "Vous avez recu un message",
  "data": {
    "conversation_id": "uuid"
  },
  "is_read": false,
  "created_at": "2026-05-24T10:00:00.000000Z"
}
```

### `POST /notifications/{id}/read`

Auth requise. Marque une notification comme lue.

### `POST /notifications/read-all`

Auth requise. Marque toutes les notifications comme lues.

## Requests et reports

### `GET /requests`

Retourne les demandes publiques actives.

### `POST /requests`

Auth requise.

Exemple :

```json
{
  "title": "Je cherche un iPhone 13",
  "description": "Budget max 200000 FCFA",
  "category": "electronique",
  "max_price": 200000,
  "country": "BJ",
  "city": "Cotonou"
}
```

### `GET /my/requests`

Auth requise. Retourne les demandes de l'utilisateur courant.

### `POST /reports`

Auth requise.

Exemple :

```json
{
  "target_type": "listing",
  "target_id": "uuid-ou-identifiant",
  "reason": "spam"
}
```

Valeurs `reason` :

- `spam`
- `fake`
- `inappropriate`
- `scam`

## Search

### `GET /search`

Recherche par texte avec filtres.

Query params :

- `q` requis
- `category`
- `type`
- `city`
- `condition`
- `min_price`
- `max_price`
- `per_page`

Exemple :

```txt
/api/v1/search?q=iphone&category=electronique&min_price=100000
```

## Web preview

Ces routes ne sont pas sous `/api/v1`.

- `GET /a/{listingId}` : preview HTML d'une annonce
- `GET /u/{username}` : preview HTML d'un vendeur
- `GET /.well-known/assetlinks.json` : Android App Links

Variables a renseigner pour `assetlinks.json` :

- `ANDROID_APP_PACKAGE_NAME`
- `ANDROID_APP_SHA256_CERT_FINGERPRINTS`
- `ANDROID_APP_PLAY_STORE_URL`

## Tests de reference

Les comportements documentes ici sont verifies dans :

- `AuthTest`
- `ListingTest`
- `SocialTest`
- `NotificationsTest`
- `SchedulerCommandsTest`
- `SearchTest`
- `ExtrasTest`
- `WebPreviewTest`
- `InfrastructureTest`
- `ProfileTest`
- `CorsTest`
