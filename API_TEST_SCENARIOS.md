# Bizo API - Scenarios de Test

Ce document sert a tester l'API Bizo de bout en bout sur un environnement reel, idealement la production ou une preproduction tres proche.

Base URL de production actuelle :

```txt
https://bizo.aiko.qzz.io/api/v1
```

## Regles generales

- Tous les tests doivent etre executes sur une base connue.
- Utiliser des comptes de test dedies.
- Conserver les tokens Bearer obtenus pendant les tests.
- Noter toute divergence entre :
  - code HTTP attendu
  - payload attendu
  - effet reel en base
  - effet reel sur queue / scheduler / stockage

## Comptes de test recommandes

Preparer au minimum :

- `seller_a`
- `buyer_a`
- `buyer_b`
- `private_user`

Exemple :

```txt
seller_a@example.com
buyer_a@example.com
buyer_b@example.com
private_user@example.com
```

## Outils conseilles

- `curl`
- `jq`
- navigateur web
- logs Docker :

```bash
sudo docker logs -f bizo-back
```

## Variables de travail

Exemple de shell local :

```bash
BASE_URL="https://bizo.aiko.qzz.io/api/v1"
SELLER_TOKEN=""
BUYER_TOKEN=""
BUYER_B_TOKEN=""
LISTING_ID=""
CONVERSATION_ID=""
TRANSACTION_ID=""
REQUEST_ID=""
```

## 1. Sante du service

### 1.1 Ping

Commande :

```bash
curl -s "$BASE_URL/ping"
```

Attendu :

- HTTP `200`
- JSON :

```json
{"status":"ok","service":"BizoAPI"}
```

### 1.2 HTTPS et redirection

Commandes :

```bash
curl -I http://bizo.aiko.qzz.io
curl -I https://bizo.aiko.qzz.io
```

Attendu :

- HTTP redirige vers HTTPS
- HTTPS repond correctement

## 2. Authentification

### 2.1 Inscription valide

Commande :

```bash
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"seller_a@example.com",
    "password":"password123",
    "password_confirmation":"password123",
    "display_name":"Seller A",
    "username":"seller_a"
  }'
```

Attendu :

- HTTP `201`
- presence de `token`
- presence de `user.id`

### 2.2 Inscription invalide

Cas a tester :

- email manquant
- email deja pris
- password trop court
- password_confirmation differente
- username invalide

Attendu :

- HTTP `422`
- erreurs de validation explicites

### 2.3 Connexion valide

Commande :

```bash
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"seller_a@example.com",
    "password":"password123"
  }'
```

Attendu :

- HTTP `200`
- token retourne
- sauvegarder le token dans `SELLER_TOKEN`

### 2.4 Connexion invalide

Cas :

- mauvais mot de passe
- email inexistant

Attendu :

- HTTP `401`
- message `Identifiants incorrects`

### 2.5 Logout

Commande :

```bash
curl -i -X POST "$BASE_URL/auth/logout" \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

Attendu :

- HTTP `200`
- le token courant n'est plus utilisable

### 2.6 Password reset

Commande :

```bash
curl -i -X POST "$BASE_URL/auth/password/reset" \
  -H "Content-Type: application/json" \
  -d '{"email":"seller_a@example.com"}'
```

Attendu :

- HTTP `200`
- message generique

### 2.7 FCM token

Commande :

```bash
curl -i -X POST "$BASE_URL/auth/fcm-token" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fcm_token":"fake-device-token"}'
```

Attendu :

- HTTP `200`
- message de succes

## 3. Profil

### 3.1 Lire son profil

```bash
curl -s "$BASE_URL/profile" \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

Attendu :

- HTTP `200`
- `display_name`, `username`, `photo_url`, `rating`, etc.

### 3.2 Modifier son profil

```bash
curl -i -X PUT "$BASE_URL/profile" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "display_name":"Seller A Updated",
    "bio":"Bio de test",
    "notif_messages":false
  }'
```

Attendu :

- HTTP `200`
- les champs modifies sont retournes

### 3.3 Upload avatar

```bash
curl -i -X POST "$BASE_URL/profile/avatar" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -F "avatar=@/chemin/vers/avatar.jpg"
```

Attendu :

- HTTP `200`
- `photo_url` renseigne

### 3.4 Profil public vendeur

```bash
curl -s "$BASE_URL/users/USER_ID"
```

Attendu :

- HTTP `200` si profil public
- HTTP `404` si profil prive

### 3.5 Listings publics vendeur

```bash
curl -s "$BASE_URL/users/USER_ID/listings"
```

Attendu :

- seulement les annonces actives

### 3.6 Reviews publiques vendeur

```bash
curl -s "$BASE_URL/users/USER_ID/reviews"
```

Attendu :

- liste paginee des avis recus

### 3.7 Suppression de compte

Utiliser un compte jetable.

```bash
curl -i -X DELETE "$BASE_URL/profile" \
  -H "Authorization: Bearer $BUYER_B_TOKEN"
```

Attendu :

- HTTP `204`
- compte supprime
- token inutilisable ensuite

## 4. Listings

### 4.1 Feed public

```bash
curl -s "$BASE_URL/listings"
```

Attendu :

- HTTP `200`
- pagination Laravel

### 4.2 Creation d'annonce valide

```bash
curl -s -X POST "$BASE_URL/listings" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -F "title=iPhone 13 128Go" \
  -F "description=Telephone en bon etat avec batterie correcte." \
  -F "type=VENTE" \
  -F "price=180000" \
  -F "category=electronique" \
  -F "condition=bon" \
  -F "delivery_mode=les_deux" \
  -F "country=BJ" \
  -F "city=Cotonou" \
  -F "neighborhood=Cadjehoun" \
  -F "photos[]=@/chemin/vers/photo1.jpg"
```

Attendu :

- HTTP `201`
- `data.id` present
- sauvegarder `LISTING_ID`

### 4.3 Creation invalide

Cas :

- sans auth
- sans photo
- `type=VENTE` sans `price`
- `type=TROC` sans `exchange_for`

Attendu :

- HTTP `401` ou `422` selon le cas

### 4.4 Detail annonce

```bash
curl -s "$BASE_URL/listings/$LISTING_ID"
```

Attendu :

- HTTP `200`
- `view_count` s’incremente

### 4.5 Update annonce

```bash
curl -i -X PUT "$BASE_URL/listings/$LISTING_ID" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"iPhone 13 128Go - prix baisse"}'
```

Attendu :

- HTTP `200`

Cas negatifs :

- autre utilisateur
- type modifie sans champs requis

### 4.6 Upload photos supplementaires

```bash
curl -i -X POST "$BASE_URL/listings/$LISTING_ID/photos" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -F "photos[]=@/chemin/vers/photo2.jpg"
```

Attendu :

- HTTP `200`

Cas negatif :

- depassement de `10` photos

### 4.7 Delete photo

```bash
curl -i -X DELETE "$BASE_URL/listings/$LISTING_ID/photos/0" \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

### 4.8 Boost

```bash
curl -i -X POST "$BASE_URL/listings/$LISTING_ID/boost" \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

Attendu :

- HTTP `200`
- `is_boosted=true`

### 4.9 Renew

Tester sur annonce expiree.

### 4.10 Similar

```bash
curl -s "$BASE_URL/listings/$LISTING_ID/similar"
```

### 4.11 My listings

```bash
curl -s "$BASE_URL/my/listings" \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

### 4.12 Delete annonce

Utiliser une annonce de test dediee.

## 5. Recherche

### 5.1 Recherche simple

```bash
curl -s "$BASE_URL/search?q=iphone"
```

### 5.2 Recherche avec filtres

```bash
curl -s "$BASE_URL/search?q=iphone&category=electronique&min_price=100000&max_price=250000&city=Cotonou"
```

Attendu :

- seulement les annonces actives
- priorite aux titres correspondants

## 6. Conversations et messages

### 6.1 Creer conversation depuis une annonce

```bash
curl -s -X POST "$BASE_URL/conversations" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"listing_id\":\"$LISTING_ID\",
    \"message\":\"Bonsoir, est-ce disponible ?\"
  }"
```

Attendu :

- HTTP `201`
- `data.id` present
- sauvegarder `CONVERSATION_ID`

### 6.2 Interdiction sur sa propre annonce

Le vendeur essaie de creer une conversation sur sa propre annonce.

Attendu :

- HTTP `400`

### 6.3 Lister ses conversations

```bash
curl -s "$BASE_URL/conversations" \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

### 6.4 Detail conversation

```bash
curl -s "$BASE_URL/conversations/$CONVERSATION_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

### 6.5 Lister messages

```bash
curl -s "$BASE_URL/conversations/$CONVERSATION_ID/messages" \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

### 6.6 Envoyer message texte

```bash
curl -i -X POST "$BASE_URL/conversations/$CONVERSATION_ID/messages" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"text","text":"Toujours disponible ?"}'
```

### 6.7 Envoyer image

```bash
curl -i -X POST "$BASE_URL/conversations/$CONVERSATION_ID/messages" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -F "type=image" \
  -F "image=@/chemin/vers/image.jpg"
```

### 6.8 Proposition de troc

Prevoir une annonce appartenant a l’acheteur.

### 6.9 Marquer lu

Tester les deux methodes exposees :

```bash
curl -i -X POST "$BASE_URL/conversations/$CONVERSATION_ID/read" \
  -H "Authorization: Bearer $SELLER_TOKEN"

curl -i -X PUT "$BASE_URL/conversations/$CONVERSATION_ID/read" \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

## 7. Transactions

### 7.1 Creer transaction valide

```bash
curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"listing_id\":\"$LISTING_ID\",
    \"buyer_id\":\"BUYER_ID\",
    \"type\":\"VENTE\",
    \"final_price\":180000
  }"
```

Attendu :

- HTTP `201`
- transaction creee
- annonce passee en `sold`
- sauvegarder `TRANSACTION_ID`

### 7.2 Cas negatifs

- acheteur tente de creer la transaction
- vendeur tente `buyer_id == seller_id`
- annonce inactive

### 7.3 Detail transaction

```bash
curl -s "$BASE_URL/transactions/$TRANSACTION_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

Attendu :

- HTTP `200`
- visible uniquement par vendeur ou acheteur

## 8. Reviews

### 8.1 Laisser un avis valide

```bash
curl -i -X POST "$BASE_URL/reviews" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"transaction_id\":\"$TRANSACTION_ID\",
    \"rating\":5,
    \"comment\":\"Transaction parfaite\"
  }"
```

Attendu :

- HTTP `201`
- recalcul de `rating` et `review_count`

### 8.2 Avis en doublon

Rejouer la meme requete.

Attendu :

- HTTP `409`

## 9. Favoris

### 9.1 Ajouter favori

```bash
curl -i -X POST "$BASE_URL/favorites/$LISTING_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

### 9.2 Lister favoris

```bash
curl -s "$BASE_URL/favorites" \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

### 9.3 Supprimer favori

```bash
curl -i -X DELETE "$BASE_URL/favorites/$LISTING_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

## 10. Notifications

### 10.1 Lister notifications

```bash
curl -s "$BASE_URL/notifications" \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

### 10.2 Marquer une notification lue

Utiliser un `NOTIFICATION_ID` existant.

```bash
curl -i -X POST "$BASE_URL/notifications/$NOTIFICATION_ID/read" \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

### 10.3 Tout marquer lu

```bash
curl -i -X POST "$BASE_URL/notifications/read-all" \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

## 11. Requests et reports

### 11.1 Creer une demande

```bash
curl -s -X POST "$BASE_URL/requests" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Je cherche un iPhone 13",
    "description":"Budget max 200000 FCFA",
    "category":"electronique",
    "max_price":200000,
    "country":"BJ",
    "city":"Cotonou"
  }'
```

Attendu :

- HTTP `201`
- sauvegarder `REQUEST_ID`

### 11.2 Lister demandes publiques

```bash
curl -s "$BASE_URL/requests"
```

### 11.3 Lister mes demandes

```bash
curl -s "$BASE_URL/my/requests" \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

### 11.4 Supprimer sa demande

```bash
curl -i -X DELETE "$BASE_URL/requests/$REQUEST_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

### 11.5 Creer un report

```bash
curl -i -X POST "$BASE_URL/reports" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"target_type\":\"listing\",
    \"target_id\":\"$LISTING_ID\",
    \"reason\":\"spam\"
  }"
```

## 12. Web preview

### 12.1 Preview annonce

Ouvrir :

```txt
https://bizo.aiko.qzz.io/a/LISTING_ID
```

Verifier :

- page HTML rendue
- meta OG presentes
- image
- lien vers vendeur

### 12.2 Preview vendeur

Ouvrir :

```txt
https://bizo.aiko.qzz.io/u/USERNAME
```

Verifier :

- page HTML rendue
- annonces actives visibles

### 12.3 Asset links

```bash
curl -s https://bizo.aiko.qzz.io/.well-known/assetlinks.json
```

Attendu :

- JSON coherent avec la config Android si renseignee

## 13. Scheduler et queue

### 13.1 Queue worker actif

```bash
sudo docker logs --tail=200 bizo-back
```

Verifier :

- pas de crash boucle
- le worker tourne

### 13.2 Scheduler actif

Verifier dans les logs :

- messages periodiques `No scheduled commands are ready to run`

### 13.3 Notification async

Scenario :

- creer conversation
- envoyer message
- verifier presence d’une notification en base / API

## 14. CORS

### 14.1 Preflight API

```bash
curl -i -X OPTIONS "$BASE_URL/ping" \
  -H "Origin: https://app.example.com" \
  -H "Access-Control-Request-Method: GET"
```

Attendu :

- headers CORS presents

## 15. Tests de robustesse minimaux

### 15.1 Route protegee sans token

Tester :

- `/profile`
- `/favorites`
- `/notifications`

Attendu :

- HTTP `401`

### 15.2 Ressource inexistante

Tester :

- `/listings/unknown-id`
- `/conversations/unknown-id`
- `/transactions/unknown-id`

Attendu :

- HTTP `404`

### 15.3 Utilisateur non autorise

Tester :

- modifier annonce d’un autre utilisateur
- lire une conversation d’un autre utilisateur
- supprimer la demande d’un autre utilisateur

Attendu :

- HTTP `403`

## 16. Validation finale avant GO

Cocher tous les points suivants :

- [ ] Ping OK
- [ ] Register/Login/Logout OK
- [ ] Profil OK
- [ ] Upload avatar OK
- [ ] Creation annonce OK
- [ ] Update/Delete annonce OK
- [ ] Recherche OK
- [ ] Conversation + message OK
- [ ] Transaction OK
- [ ] Review OK
- [ ] Favoris OK
- [ ] Notifications OK
- [ ] Requests + delete request OK
- [ ] Reports OK
- [ ] Web preview OK
- [ ] Queue OK
- [ ] Scheduler OK
- [ ] HTTPS OK
- [ ] CORS OK

## 17. Notes d'execution

- Documenter ici les IDs utilises pendant la campagne de test.
- Conserver ici les anomalies constatees.
- Marquer ici les points bloques par manque de donnees ou de credentials.

Exemple :

```txt
LISTING_ID=
CONVERSATION_ID=
TRANSACTION_ID=
REQUEST_ID=
NOTIFICATION_ID=
```
