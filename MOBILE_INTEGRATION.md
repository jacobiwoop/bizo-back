# Bizo Mobile Integration Guide

Guide d'integration pratique pour une app mobile Android/iOS ou une IA chargee du client mobile.

Base URL de production :

```txt
https://bizo.aiko.qzz.io/api/v1
```

## Etat valide

Les flux suivants ont ete testes en conditions reelles sur la prod :

- inscription / connexion
- logout
- password reset complet
- profil + avatar
- creation d'annonce avec upload image
- favoris
- conversations / messages lus
- transactions
- avis
- previews web
- FCM token save
- envoi FCM direct Firebase
- envoi FCM via backend Laravel jusqu'a reception reelle

## Regles client

- Auth API : `Authorization: Bearer <token>`
- Format standard : `application/json`
- Upload image : `multipart/form-data`
- Pagination Laravel : `data`, `links`, `meta`
- Rate limit nominal : `120 req/min`
- Les dates sont en ISO 8601 UTC

## Flux d'authentification

### Register

`POST /auth/register`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "display_name": "Aiko",
  "username": "aiko_dev"
}
```

Reponse utile :

```json
{
  "token": "plain-text-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "Aiko",
    "username": "aiko_dev"
  }
}
```

### Login

`POST /auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Reponses :

- `200` avec `token` et `user`
- `401` si identifiants invalides

### Logout

`POST /auth/logout`

Header :

```txt
Authorization: Bearer <token>
```

## Reset password

### Demande de reset

`POST /auth/password/reset`

```json
{
  "email": "user@example.com"
}
```

Reponse :

```json
{
  "message": "Si ce compte existe, un lien de réinitialisation a été envoyé par email."
}
```

### Validation du reset

`POST /auth/password/update`

```json
{
  "token": "reset-token",
  "email": "user@example.com",
  "password": "NewPassword123",
  "password_confirmation": "NewPassword123"
}
```

## Gestion du token FCM

Apres login, l'app doit envoyer son token FCM au backend.

`POST /auth/fcm-token`

```json
{
  "fcm_token": "fcm-device-token"
}
```

Comportement recommande cote app :

1. login
2. recuperation du token FCM local
3. appel de `/auth/fcm-token`
4. re-appel si le token change

## Profil courant

### Lire le profil

`GET /profile`

Champs utiles en pratique :

- `id`
- `email`
- `display_name`
- `username`
- `photo_url`
- `bio`
- `country_code`
- `rating`
- `review_count`
- `total_sales`
- `is_verified`
- `has_seen_onboarding`

### Modifier le profil

`PUT /profile`

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

### Upload avatar

`POST /profile/avatar`

`multipart/form-data`

Champ :

- `avatar`

Formats acceptes :

- `jpg`
- `jpeg`
- `png`
- `webp`

Taille max :

- `5 Mo`

## Listings

### Feed

`GET /listings`

Filtres utiles :

- `per_page`
- `category`
- `type`
- `condition`
- `country`
- `city`
- `min_price`
- `max_price`

### Recherche

`GET /search?q=iphone`

Filtres supportes :

- `category`
- `type`
- `city`
- `condition`
- `min_price`
- `max_price`

### Detail annonce

`GET /listings/{id}`

### Creer une annonce

`POST /listings`

`multipart/form-data`

Champs :

- `title`
- `description`
- `type`
- `price`
- `cash_complement`
- `exchange_for`
- `category`
- `condition`
- `delivery_mode`
- `country`
- `city`
- `neighborhood`
- `tags[]`
- `photos[]`

Contraintes metier :

- `type = VENTE` => `price` requis
- `type = TROC|TROC_CASH` => `exchange_for` requis
- `photos[]` min `1`, max `10`

### Mettre a jour une annonce

`PUT /listings/{id}`

Mise a jour partielle supportee.

### Ajouter des photos

`POST /listings/{id}/photos`

### Supprimer une photo

`DELETE /listings/{id}/photos/{idx}`

### Mes annonces

`GET /my/listings`

## Social

### Conversations

- `GET /conversations`
- `GET /conversations/{id}`
- `POST /conversations`

Creation :

```json
{
  "listing_id": "uuid",
  "message": "Bonjour, est-ce disponible ?"
}
```

### Messages

- `GET /conversations/{id}/messages`
- `POST /conversations/{id}/messages`
- `POST /conversations/{id}/read`
- `PUT /conversations/{id}/read`

### Favoris

- `GET /favorites`
- `POST /favorites/{listingId}`
- `DELETE /favorites/{listingId}`

### Transactions

- `POST /transactions`
- `GET /transactions/{id}`

Creation :

```json
{
  "listing_id": "uuid",
  "buyer_id": "uuid",
  "type": "VENTE",
  "final_price": 150000
}
```

Regle :

- le vendeur ne peut pas etre son propre acheteur

### Reviews

- `POST /reviews`
- `GET /users/{uid}/reviews`

Creation :

```json
{
  "transaction_id": "uuid",
  "rating": 5,
  "comment": "Transaction parfaite"
}
```

## Notifications

- `GET /notifications`
- `POST /notifications/read-all`
- `POST /notifications/{id}/read`

Types observes en pratique :

- `new_message`
- `new_favorite`
- `transaction_done`

## Pages web utiles au mobile

Pour partage social / ouverture externe :

- preview annonce : `/a/{listingId}`
- preview vendeur : `/u/{username}`

## Erreurs a gerer cote app

- `401` : token invalide / expire
- `403` : action interdite
- `404` : ressource introuvable
- `409` : doublon metier, ex. avis deja existant
- `422` : validation
- `429` : rate limit

Format `422` typique :

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "message erreur"
    ]
  }
}
```

## Strategie client recommandee

### Session

- stocker le Bearer token en local securise
- charger `/profile` juste apres login
- supprimer le token local apres logout

### Uploads

- compresser/redimensionner cote app si possible
- garder un timeout plus long pour `multipart/form-data`

### Notifications push

- demander permission push au bon moment UX
- envoyer le token FCM apres login
- re-synchroniser si Firebase regenere le token

### Synchronisation UI

- feed / search / lists : support pagination Laravel
- utiliser `created_at`, `updated_at`, `expires_at`
- rafraichir detail annonce apres action transaction / favori / boost / renew

## Endpoints minimaux a implementer en premier cote mobile

### MVP auth/profil

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /profile`
- `PUT /profile`
- `POST /profile/avatar`
- `POST /auth/fcm-token`

### MVP annonces

- `GET /listings`
- `GET /search`
- `GET /listings/{id}`
- `POST /listings`
- `PUT /listings/{id}`
- `GET /my/listings`

### MVP social

- `GET /conversations`
- `GET /conversations/{id}`
- `POST /conversations`
- `GET /conversations/{id}/messages`
- `POST /conversations/{id}/messages`
- `PUT /conversations/{id}/read`
- `GET /favorites`
- `POST /favorites/{listingId}`
- `DELETE /favorites/{listingId}`

## References repo

- doc API generale : [API.md](./API.md)
- scenarios de test reels : [API_TEST_SCENARIOS.md](./API_TEST_SCENARIOS.md)
- suivi projet : [PROGRESS.md](./PROGRESS.md)
