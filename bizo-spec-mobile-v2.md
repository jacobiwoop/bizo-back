# Bizo — Specification Mobile V2
**Stack cible : Android Kotlin/Compose + API Laravel Bizo + MySQL + FCM**
*Woopchi Digital · v2 backend-realite · 2026*

---

## 1. Vue d'ensemble

Cette version remplace l'ancienne specification fondee sur Supabase.

La realite actuelle du projet est :

- app mobile Android Kotlin / Jetpack Compose
- backend Laravel deja deploye et teste en production
- base MySQL distante
- stockage fichiers via `storage/public`
- notifications push via Firebase Cloud Messaging
- reverse proxy nginx devant un conteneur Docker

Base URL de production :

```txt
https://bizo.aiko.qzz.io/api/v1
```

Objectif de ce document :

- donner a une equipe mobile ou a une IA une reference produit + technique fiable
- decrire les ecrans cibles
- decrire les contrats reels de l'API
- decrire les flux utilisateur
- decrire les erreurs a gerer
- decrire ce qui est deja valide en prod

---

## 2. Architecture reelle

```txt
┌──────────────────────────────────────────────┐
│           App Android Kotlin/Compose         │
│   Navigation · DataStore · Ktor/HTTP · FCM   │
└──────────────────────┬───────────────────────┘
                       │ HTTPS + Bearer token
┌──────────────────────▼───────────────────────┐
│              Backend Bizo (Laravel)          │
├──────────────────────────────────────────────┤
│ Auth Sanctum                                 │
│ Listings / Search                            │
│ Profile / Avatar                             │
│ Favorites                                    │
│ Conversations / Messages                     │
│ Transactions / Reviews                       │
│ Notifications in-app                         │
│ FCM token registration                       │
│ Password reset by email                      │
│ Web preview / Open Graph                     │
└──────────────────────┬───────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  MySQL + local file storage │
        │  Firebase Cloud Messaging   │
        └─────────────────────────────┘
```

Le mobile ne doit plus dependre de Supabase.

---

## 3. Capacites backend deja validees

Ces flux ont ete testes reellement sur la prod :

- inscription
- connexion
- deconnexion
- forgot password
- reset password complet
- lecture profil
- mise a jour profil
- upload avatar
- creation d'annonce avec image reelle
- lecture detail annonce
- recherche
- favoris
- creation conversation
- envoi de message texte
- marquage lu
- creation transaction
- creation avis
- lecture avis utilisateur
- lecture notifications
- enregistrement token FCM
- reception push FCM reelle
- web preview vendeur
- web preview annonce

Conclusion :

- la reference fonctionnelle doit partir de l'API Laravel existante
- pas de logique mobile basee sur l'ancien modele Supabase

---

## 4. Regles globales d'integration mobile

### 4.1 Auth

Les routes protegees utilisent :

```txt
Authorization: Bearer <token>
```

Le token provient de `login` ou `register`.

### 4.2 Formats de requete

- JSON : `Content-Type: application/json`
- upload de fichiers : `multipart/form-data`

### 4.3 Pagination

Les listes paginees suivent le format Laravel standard :

```json
{
  "data": [],
  "links": {
    "first": "https://...",
    "last": "https://...",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "path": "https://...",
    "per_page": 20,
    "to": 1,
    "total": 1
  }
}
```

### 4.4 Dates

Les dates sont en ISO 8601 UTC.

Exemple :

```txt
2026-05-24T15:03:43.000000Z
```

### 4.5 Rate limit

Valeur observee :

- `120 req/min`

Le client doit gerer `429`.

### 4.6 Erreurs

Codes principaux :

- `200` succes
- `201` creation
- `204` suppression sans body
- `401` auth invalide
- `403` interdit
- `404` introuvable
- `409` conflit metier
- `422` validation
- `429` rate limit
- `500` erreur serveur

Format `422` attendu :

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "Message d'erreur"
    ]
  }
}
```

Le client mobile doit afficher les erreurs utiles a l'utilisateur, pas seulement logger.

---

## 5. Modele de session mobile

Flux recommande :

1. `POST /auth/login` ou `POST /auth/register`
2. stocker le Bearer token en local securise
3. stocker aussi le `UserResource`
4. appeler `GET /profile` au lancement si token present
5. recuperer le token FCM local
6. appeler `POST /auth/fcm-token`
7. a la deconnexion :
   - `POST /auth/logout`
   - suppression du token local
   - suppression du cache session mobile

Le `Splash` doit verifier la presence de session locale, puis hydrater ou invalider proprement.

---

## 6. Objets metier reels

### 6.1 User

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "display_name": "Aiko",
  "username": "aiko_dev",
  "photo_url": "/storage/avatars/xxx.png",
  "bio": "Bio utilisateur",
  "country_code": "BJ",
  "rating": 4.5,
  "review_count": 12,
  "total_sales": 4,
  "is_verified": false,
  "has_seen_onboarding": true,
  "created_at": "2026-05-24T15:03:43.000000Z"
}
```

### 6.2 Listing

```json
{
  "id": "uuid",
  "title": "Samsung A55",
  "description": "Description complete...",
  "type": "VENTE",
  "price": 150000,
  "cash_complement": null,
  "exchange_for": null,
  "category": "electronique",
  "condition": "bon",
  "delivery_mode": "les_deux",
  "photos": [
    "/storage/photos/xxx.webp"
  ],
  "country": "BJ",
  "city": "Cotonou",
  "neighborhood": "Cadjehoun",
  "tags": [],
  "view_count": 12,
  "favorite_count": 3,
  "status": "active",
  "is_boosted": false,
  "price_history": [],
  "expires_at": "2026-06-23T12:00:00.000000Z",
  "created_at": "2026-05-24T12:00:00.000000Z",
  "updated_at": "2026-05-24T12:00:00.000000Z",
  "owner": {
    "id": "uuid",
    "email": "seller@example.com",
    "display_name": "Seller",
    "username": "seller01",
    "photo_url": "/storage/avatars/xxx.png",
    "bio": null,
    "country_code": "BJ",
    "rating": 4.8,
    "review_count": 10,
    "total_sales": 5,
    "is_verified": false,
    "has_seen_onboarding": true,
    "created_at": "2026-05-01T10:00:00.000000Z"
  }
}
```

### 6.3 Favorite

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "listing_id": "uuid",
  "listing_title": "Samsung A55",
  "listing_photo": "/storage/photos/xxx.webp",
  "listing_price": 150000,
  "listing_type": "VENTE",
  "created_at": "2026-05-24T12:00:00.000000Z",
  "listing": { "...ListingResource optionnel..." }
}
```

### 6.4 Conversation

```json
{
  "id": "conv_id",
  "listing_id": "uuid",
  "listing_title": "Samsung A55",
  "listing_photo": "/storage/photos/xxx.webp",
  "last_message": "Toujours dispo ?",
  "last_message_at": "2026-05-24T12:00:00.000000Z",
  "unread_count": 1,
  "other_user": {
    "id": "uuid",
    "display_name": "Seller",
    "photo_url": "/storage/avatars/xxx.png",
    "last_seen_at": "2026-05-24T11:59:00.000000Z"
  },
  "created_at": "2026-05-24T11:50:00.000000Z"
}
```

### 6.5 Message

```json
{
  "id": "uuid",
  "conv_id": "conv_id",
  "sender_id": "uuid",
  "type": "text",
  "text": "Bonjour",
  "image_url": null,
  "proposal": null,
  "is_read": false,
  "created_at": "2026-05-24T12:00:00.000000Z"
}
```

Cas `troc_proposal` :

```json
{
  "proposal": {
    "offered_listing_id": "uuid",
    "offered_listing_title": "iPhone 12",
    "offered_listing_photo": "/storage/photos/xxx.webp",
    "cash_amount": 20000,
    "status": "pending",
    "refusal_reason": null
  }
}
```

### 6.6 Transaction

```json
{
  "id": "uuid",
  "listing_id": "uuid",
  "seller_id": "uuid",
  "buyer_id": "uuid",
  "type": "VENTE",
  "final_price": 150000,
  "seller_reviewed": false,
  "buyer_reviewed": false,
  "created_at": "2026-05-24T12:00:00.000000Z"
}
```

### 6.7 Review

```json
{
  "id": "uuid",
  "from_uid": "uuid",
  "to_uid": "uuid",
  "listing_id": "uuid",
  "transaction_id": "uuid",
  "rating": 5,
  "comment": "Vendeur serieux",
  "author": {
    "id": "uuid",
    "email": "buyer@example.com",
    "display_name": "Buyer",
    "username": "buyer01",
    "photo_url": null,
    "bio": null,
    "country_code": "BJ",
    "rating": 0,
    "review_count": 0,
    "total_sales": 0,
    "is_verified": false,
    "has_seen_onboarding": true,
    "created_at": "2026-05-20T10:00:00.000000Z"
  },
  "created_at": "2026-05-24T12:00:00.000000Z"
}
```

### 6.8 Notification

```json
{
  "id": "uuid",
  "type": "new_favorite",
  "title": "Nouveau favori",
  "body": "Quelqu un a ajoute votre annonce en favori.",
  "data": {
    "type": "new_favorite",
    "listing_id": "uuid"
  },
  "is_read": false,
  "created_at": "2026-05-24T12:00:00.000000Z"
}
```

---

## 7. Donnees metier deduites de la base

### 7.1 Users

Champs utiles a l'app :

- identite : `id`, `email`, `display_name`, `username`
- profil public : `photo_url`, `bio`, `country_code`
- reputation : `rating`, `review_count`, `total_sales`, `is_verified`
- onboarding : `has_seen_onboarding`

### 7.2 Listings

Une annonce contient :

- un type transactionnel
- un lot de photos
- une localisation
- un etat
- une categorie
- un statut
- un owner

### 7.3 Conversations / Messages

Le systeme de messagerie est persistant cote backend.

Il n'y a plus de dependance a un realtime externe type Supabase Realtime.

Strategie mobile recommandee :

- polling pagine simple
- refresh manuel
- plus tard : websocket / SSE si besoin

### 7.4 Notifications

Deux couches existent :

- notifications in-app stockees en base
- notifications push via FCM

Le mobile doit gerer les deux.

---

## 8. Ecrans cibles V2

Cette section decrit la structure produit cible.

### 8.1 Ecrans fondamentaux

1. Splash
2. Onboarding
3. Auth
4. Home / Feed
5. Search / Filtres
6. Detail annonce
7. Publish annonce
8. Messages / Conversations
9. Detail conversation
10. Favorites
11. Notifications
12. Profile
13. Edit profile
14. My listings
15. Public seller profile
16. Reviews seller
17. Forgot password
18. Reset password

### 8.2 Ecrans metier secondaires

19. Create transaction / confirmation
20. Leave review
21. Requests / Je cherche
22. Report content

---

## 9. Etat actuel du repo mobile

Ce qui existe deja dans l'app :

- Splash
- Onboarding
- Auth
- Home
- Detail annonce
- Publish
- Messages
- Profile
- My listings

Ce qui manque encore ou reste partiel :

- Search reel
- Favorites screen
- Notifications screen
- conversation detail fonctionnelle
- forgot/reset password UI
- edit profile
- upload avatar UI complet
- transaction/review UI
- seller public profile
- requests/reports UI

Important :

- plusieurs ecrans presents sont encore partiellement mockes
- la spec cible doit guider la finalisation

---

## 10. Navigation cible

```txt
Splash
 ├─ si session valide -> Home
 └─ sinon -> Onboarding/Auth

Home
 ├─ Search
 ├─ Detail annonce
 ├─ Publish
 ├─ Messages
 ├─ Favorites
 ├─ Notifications
 └─ Profile

Profile
 ├─ Edit profile
 ├─ My listings
 ├─ Reviews
 └─ Logout

Detail annonce
 ├─ Favorite toggle
 ├─ Contacter vendeur
 ├─ Voir profil vendeur
 └─ Proposer transaction / troc
```

---

## 11. User flows

### 11.1 Inscription

1. utilisateur remplit email / mot de passe / display name / username
2. app appelle `POST /auth/register`
3. app stocke token + user
4. app appelle `POST /auth/fcm-token` si token device pret
5. navigation vers Home

### 11.2 Connexion

1. utilisateur saisit email / mot de passe
2. app appelle `POST /auth/login`
3. app stocke session
4. app charge profil
5. app enregistre FCM
6. navigation Home

### 11.3 Forgot / Reset password

1. utilisateur saisit son email
2. app appelle `POST /auth/password/reset`
3. backend envoie un email
4. utilisateur ouvre le lien
5. app ou webview recupere `token` + `email`
6. app appelle `POST /auth/password/update`
7. utilisateur se reconnecte

### 11.4 Publication annonce

1. utilisateur selectionne 1 a 10 images
2. saisit titre / description / categorie / etat
3. choisit type :
   - VENTE
   - TROC
   - TROC_CASH
4. renseigne champs dependants :
   - prix si VENTE
   - exchange_for si TROC ou TROC_CASH
   - cash_complement si TROC_CASH optionnel selon UX retenue
5. renseigne ville / quartier
6. app envoie `multipart/form-data` vers `POST /listings`
7. backend retourne `201`
8. app redirige vers detail annonce ou My listings

### 11.5 Favori

1. utilisateur ouvre une annonce
2. clique favori
3. app appelle :
   - `POST /favorites/{listingId}` si non favori
   - `DELETE /favorites/{listingId}` si deja favori
4. UI se met a jour
5. le vendeur peut recevoir une notification

### 11.6 Conversation

1. utilisateur ouvre une annonce
2. clique “Contacter”
3. app appelle `POST /conversations`
4. si succes :
   - retourne `data` conversation
   - retourne aussi le premier `message`
5. app navigue vers le thread

### 11.7 Message texte

1. utilisateur tape un texte
2. app appelle `POST /conversations/{id}/messages`
3. backend retourne `{ data: MessageResource }`
4. thread se met a jour
5. le destinataire peut recevoir une notif push

### 11.8 Transaction

1. acheteur et vendeur se mettent d'accord
2. app appelle `POST /transactions`
3. backend cree la transaction
4. les participants peuvent ensuite laisser un avis

### 11.9 Review

1. utilisateur note une transaction
2. app appelle `POST /reviews`
3. backend cree l'avis
4. le profil du vendeur/acheteur doit refleter les stats mises a jour

---

## 12. Contrats API par domaine

## 12.1 Auth

### `POST /auth/register`

Body :

```json
{
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "display_name": "Aiko",
  "username": "aiko_dev"
}
```

Succes :

- `201`
- retourne `token` + `user`

### `POST /auth/login`

Body :

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Succes :

- `200`
- retourne `token` + `user`

Erreur :

- `401`

### `POST /auth/logout`

Protegee.

Succes :

- `200`

### `POST /auth/password/reset`

Body :

```json
{
  "email": "user@example.com"
}
```

Succes :

- `200`
- message generique

### `POST /auth/password/update`

Body :

```json
{
  "token": "reset_token",
  "email": "user@example.com",
  "password": "NouveauMotDePasse123",
  "password_confirmation": "NouveauMotDePasse123"
}
```

Succes :

- `200`

### `POST /auth/fcm-token`

Body :

```json
{
  "fcm_token": "token"
}
```

Succes :

- `200`

---

## 12.2 Profile

### `GET /profile`

Retour :

- `UserResource`

### `PUT /profile`

Champs utiles :

```json
{
  "display_name": "Aiko",
  "username": "aiko_dev",
  "bio": "Bio",
  "country_code": "BJ",
  "notif_messages": true,
  "notif_troc": true,
  "notif_rappels": true,
  "notif_favoris": true,
  "has_seen_onboarding": true
}
```

Succes :

- `200`
- retourne `UserResource`

### `POST /profile/avatar`

Multipart :

- `avatar`

Contraintes :

- image `jpg`, `jpeg`, `png`, `webp`
- max `5 Mo`

Succes :

- `200`
- retourne `UserResource`

---

## 12.3 Listings

### `GET /listings`

Filtres utiles :

- `category`
- `type`
- `condition`
- `country`
- `city`
- `min_price`
- `max_price`
- `per_page`

Retour :

- collection paginee de `ListingResource`

### `GET /listings/{id}`

Retour :

```json
{
  "data": { "...ListingResource..." }
}
```

### `POST /listings`

Multipart.

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

Regles majeures :

- `title` min 5 max 80
- `description` min 20 max 500
- `type` in `VENTE,TROC,TROC_CASH`
- `price` requis si `VENTE`
- `exchange_for` requis si `TROC` ou `TROC_CASH`
- `condition` in `neuf,excellent,bon,correct`
- `delivery_mode` in `main_propre,livraison,les_deux`
- `photos[]` min 1 max 10
- chaque photo max 5 Mo

Succes :

- `201`
- retourne `{ data: ListingResource }`

### `GET /my/listings`

Retour :

- collection paginee des annonces du user connecte

---

## 12.4 Search

### `GET /search`

Parametres :

- `q`
- `category`
- `city`
- `min_price`
- `max_price`
- `per_page`

Retour :

- collection paginee de `ListingResource`

---

## 12.5 Favorites

### `GET /favorites`

Retour :

- collection paginee de `FavoriteResource`

### `POST /favorites/{listingId}`

Succes :

- `201`

### `DELETE /favorites/{listingId}`

Succes :

- `200` ou `204` selon implementation client attendue

Le mobile doit mettre a jour son etat local sans supposer que `favorites.data` est une liste brute de listings.

---

## 12.6 Conversations / Messages

### `GET /conversations`

Retour :

- collection paginee de `ConversationResource`

### `POST /conversations`

Body :

```json
{
  "listing_id": "uuid",
  "message": "Bonjour, toujours dispo ?"
}
```

Succes :

```json
{
  "data": { "...ConversationResource..." },
  "message": { "...MessageResource..." }
}
```

### `GET /conversations/{id}/messages`

Retour :

- collection paginee de `MessageResource`

### `POST /conversations/{id}/messages`

Body texte :

```json
{
  "type": "text",
  "text": "Bonjour"
}
```

Succes :

```json
{
  "data": { "...MessageResource..." }
}
```

### `POST /conversations/{id}/read`

Succes :

- `200`

---

## 12.7 Transactions

### `POST /transactions`

Body :

```json
{
  "listing_id": "uuid",
  "buyer_id": "uuid",
  "type": "VENTE",
  "final_price": 150000
}
```

Succes :

```json
{
  "data": { "...TransactionResource..." }
}
```

---

## 12.8 Reviews

### `POST /reviews`

Body :

```json
{
  "transaction_id": "uuid",
  "rating": 5,
  "comment": "Transaction parfaite"
}
```

Succes :

```json
{
  "data": { "...ReviewResource..." }
}
```

### `GET /users/{id}/reviews`

Retour :

- collection paginee de `ReviewResource`

---

## 12.9 Notifications

### `GET /notifications`

Retour :

- collection paginee de `NotificationResource`

### `POST /notifications/{id}/read`

Succes :

- `200`

### `POST /notifications/read-all`

Succes :

- `200`

---

## 12.10 Requests / Je cherche

Backend present.

Fonctions observees :

- liste publique de requests
- liste mes requests
- creation request
- suppression request

La V2 mobile peut l'integrer comme flux secondaire apres le coeur marketplace.

---

## 12.11 Reports

Backend present.

Le client peut proposer un flux “Signaler” sur :

- annonce
- utilisateur
- message

Motifs :

- `spam`
- `fake`
- `inappropriate`
- `scam`

---

## 13. FCM mobile

Flux recommande :

1. l'app obtient un token FCM natif Android
2. l'app appelle `POST /auth/fcm-token`
3. le backend stocke le token
4. un evenement metier declenche une notification
5. le device recoit le push

Ce flux a ete valide reellement sur l'infra.

Exemple recu :

- title : `Nouveau favori`
- body : `Quelqu un a ajoute votre annonce en favori.`
- data.type : `new_favorite`
- data.listing_id : `uuid`

Le client doit router selon `data.type`.

Exemples de `type` a prevoir :

- `new_favorite`
- `new_message`
- `transaction_update`
- `review_received`

---

## 14. Previews web et deep links

Backend expose :

- `/a/{listingId}` pour preview annonce
- `/u/{username}` pour preview vendeur
- `/.well-known/assetlinks.json`

Etat actuel :

- previews web OK
- App Links Android a finaliser quand package name + SHA256 definitifs seront connus

La spec mobile doit prevoir une future prise en charge du deep linking.

---

## 15. Priorite MVP mobile

Ordre recommande :

1. Auth
2. Session persistante
3. Home feed
4. Search
5. Detail annonce
6. Publish avec vrai multi-upload
7. Favorites
8. Conversations list
9. Conversation detail
10. Profile
11. Edit profile + avatar
12. Notifications
13. Forgot/reset password
14. Transactions
15. Reviews

---

## 16. Ecarts connus entre l'app actuelle et la spec cible

Ecarts importants observes :

- ecran Messages encore mocke
- ecran Detail encore partiellement mocke
- Publish encore incomplet sur le multi-upload
- pas de vrai Search screen
- pas d'ecran Favorites
- pas d'ecran Notifications
- pas d'ecran forgot/reset password
- pas d'ecran edit profile complet
- logout UI encore incomplet
- plusieurs DTO ou flux backend doivent encore etre alignes

Cette spec doit servir de reference pour corriger ces ecarts.

---

## 17. Regles produit importantes

1. une annonce doit avoir au moins 1 photo
2. maximum 10 photos par annonce
3. VENTE exige un prix
4. TROC et TROC_CASH exigent `exchange_for`
5. les listes doivent supporter pagination
6. le mobile ne doit pas masquer les erreurs backend avec des mocks
7. les URLs retournees par l'API sont en HTTPS production
8. le mobile doit gerer les notifications in-app et push
9. le reset password repose sur email
10. les resources backend font foi sur la forme des objets

---

## 18. Conclusion

La base de reference mobile n'est plus Supabase.

La base correcte est maintenant :

- backend Laravel Bizo en production
- contrats JSON reels
- uploads multipart reels
- FCM reel
- user flows reels valides

Cette V2 doit remplacer l'ancienne logique produit/technique dans toute nouvelle implementation mobile.
