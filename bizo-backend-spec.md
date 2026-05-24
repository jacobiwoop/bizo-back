# Bizo API — Spécification Technique Backend
**Stack : Laravel 11 · MySQL · Docker · Render** *Woopchi Digital · v1.0 · 2026*
 
---
 
## Vue d'ensemble de l'architecture
 
```
┌─────────────────────────────────────────────────┐
│              App Android (Kotlin)                │
│         Jetpack Compose · Navigation             │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS / JSON
        ┌──────────────▼──────────────┐
        │      BIZO API (Laravel 11)  │
        │   Routes · Controllers      │
        │   Middleware · Policies     │
        │   Jobs · Scheduler          │
        └──────┬──────────────┬───────┘
               │              │
   ┌───────────▼──┐    ┌──────▼──────────┐
   │  mySQL  │    │  Firebase FCM   │
   │  (Render DB) │    │  (push gratuit) │
   └───────────────┘    └─────────────────┘
               │
   ┌───────────▼──────────┐
   │  Storage local/S3    │
   │  (photos annonces)   │
   └──────────────────────┘
```
 
---
 
## Stack technique détaillée
 
| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | Laravel | 11.x |
| Langage | PHP | 8.3+ |
| Base de données | MySQL | 8.0+ |
| ORM | Eloquent | intégré Laravel |
| Auth | Laravel Sanctum | tokens API |
| Push notifications | Firebase FCM | HTTP v1 API |
| Storage | Local (dev) / S3-compatible (prod) | Laravel Filesystem |
| Queue | Database driver | intégré Laravel |
| Scheduler | Laravel Scheduler | intégré |
| Serveur HTTP | FrankenPHP | 1.x |
| Containerisation | Docker + Docker Compose | - |
| Déploiement | Render.com | - |
| Web preview | Blade template | intégré Laravel |
 
---
 
## Structure du projet Laravel
 
```
bizo-api/
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       ├── SendListingReminders.php     ← rappel J+3
│   │       └── ExpireListings.php           ← expiration J+30
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── ListingController.php
│   │   │   ├── ConversationController.php
│   │   │   ├── MessageController.php
│   │   │   ├── FavoriteController.php
│   │   │   ├── ReviewController.php
│   │   │   ├── TransactionController.php
│   │   │   ├── NotificationController.php
│   │   │   ├── ProfileController.php
│   │   │   ├── ReportController.php
│   │   │   ├── RequestController.php
│   │   │   └── WebPreviewController.php
│   │   ├── Middleware/
│   │   │   └── SetLastSeenAt.php
│   │   └── Requests/               ← Form Requests (validation)
│   │       ├── StoreListingRequest.php
│   │       ├── SendMessageRequest.php
│   │       └── ...
│   ├── Models/
│   │   ├── User.php
│   │   ├── Listing.php
│   │   ├── Conversation.php
│   │   ├── Message.php
│   │   ├── Favorite.php
│   │   ├── Review.php
│   │   ├── Transaction.php
│   │   ├── Notification.php
│   │   ├── Report.php
│   │   └── ListingRequest.php
│   ├── Jobs/
│   │   └── SendPushNotification.php
│   ├── Services/
│   │   ├── FcmService.php           ← envoi push via FCM HTTP v1
│   │   ├── StorageService.php       ← upload/delete photos
│   │   └── ConversationService.php  ← logique convId
│   └── Policies/
│       ├── ListingPolicy.php
│       ├── ConversationPolicy.php
│       └── MessagePolicy.php
├── database/
│   ├── migrations/                  ← une migration par table
│   └── seeders/
├── routes/
│   ├── api.php                      ← toutes les routes API
│   └── web.php                      ← routes web preview
├── resources/
│   └── views/
│       └── preview/
│           ├── listing.blade.php    ← /a/{listingId}
│           └── seller.blade.php     ← /u/{username}
├── storage/
│   └── app/public/                  ← photos en local (dev)
├── docker/
│   ├── Dockerfile
│   └── start.sh
├── docker-compose.yml
├── .env.example
└── render.yaml                      ← config déploiement Render
```
 
---
 
## Variables d'environnement (.env)
 
```env
APP_NAME=BizoAPI
APP_ENV=production
APP_KEY=                          # php artisan key:generate
APP_DEBUG=false
APP_URL=http://0.0.0.0            # accepte tout (local comme serveur)
 
DB_CONNECTION=mysql
DB_HOST=mnz.domcloud.co
DB_PORT=3306
DB_DATABASE=bizowoop
DB_USERNAME=bizowoop
DB_PASSWORD=                      # à définir en secret (Render dashboard)
 
FILESYSTEM_DISK=local             # local uniquement (pas de S3 pour l'instant)
 
# Firebase FCM (Service Account)
FCM_PROJECT_ID=bizo-f2187
FCM_SERVICE_ACCOUNT_JSON=         # JSON du compte de service Firebase encodé en base64
 
QUEUE_CONNECTION=database
CACHE_DRIVER=database
 
# CORS — accepte tout pour le moment
FRONTEND_URL=*
SANCTUM_STATEFUL_DOMAINS=*
SESSION_DOMAIN=*
```
 
---
 
## Routes API complètes
 
```
Base URL : https://api.bizo.woopchi.com/api/v1
 
─── AUTH ──────────────────────────────────────────────────
POST   /auth/register              → inscription
POST   /auth/login                 → connexion
POST   /auth/logout                → déconnexion [auth]
POST   /auth/password/reset        → demande reset
POST   /auth/password/update       → nouveau mot de passe
 
─── PROFIL ────────────────────────────────────────────────
GET    /profile                    → mon profil [auth]
PUT    /profile                    → modifier mon profil [auth]
POST   /profile/avatar             → upload photo profil [auth]
DELETE /profile                    → supprimer mon compte [auth]
GET    /users/{uid}                → profil public d'un vendeur
GET    /users/{uid}/listings       → annonces actives d'un vendeur
 
─── ANNONCES ──────────────────────────────────────────────
GET    /listings                   → feed (avec filtres)
POST   /listings                   → créer annonce [auth]
GET    /listings/{id}              → détail annonce
PUT    /listings/{id}              → modifier annonce [auth, owner]
DELETE /listings/{id}              → supprimer annonce [auth, owner]
POST   /listings/{id}/photos       → upload photos [auth, owner]
DELETE /listings/{id}/photos/{idx} → supprimer une photo [auth, owner]
POST   /listings/{id}/boost        → booster annonce [auth, owner]
POST   /listings/{id}/renew        → renouveler annonce expirée [auth, owner]
GET    /listings/{id}/similar      → annonces similaires
 
─── MES ANNONCES ──────────────────────────────────────────
GET    /my/listings                → mes annonces [auth]
 
─── FAVORIS ───────────────────────────────────────────────
GET    /favorites                  → mes favoris [auth]
POST   /favorites/{listingId}      → ajouter/retirer favori [auth]
 
─── CONVERSATIONS ─────────────────────────────────────────
GET    /conversations              → liste conversations [auth]
POST   /conversations              → créer/ouvrir conversation [auth]
GET    /conversations/{id}         → détail conversation [auth, participant]
GET    /conversations/{id}/messages→ liste messages [auth, participant]
POST   /conversations/{id}/messages→ envoyer message [auth, participant]
PUT    /conversations/{id}/read    → marquer comme lu [auth, participant]
 
─── TRANSACTIONS ──────────────────────────────────────────
POST   /transactions               → confirmer vente [auth, seller]
GET    /transactions/{id}          → détail transaction [auth, participant]
 
─── AVIS ──────────────────────────────────────────────────
POST   /reviews                    → laisser un avis [auth]
GET    /users/{uid}/reviews        → avis reçus par un utilisateur
 
─── NOTIFICATIONS ─────────────────────────────────────────
GET    /notifications              → mes notifications [auth]
PUT    /notifications/{id}/read    → marquer notif lue [auth]
PUT    /notifications/read-all     → tout marquer lu [auth]
PUT    /profile/push-token         → mettre à jour FCM token [auth]
 
─── SIGNALEMENTS ──────────────────────────────────────────
POST   /reports                    → signaler [auth]
 
─── DEMANDES "JE CHERCHE" ─────────────────────────────────
GET    /requests                   → liste des demandes actives
POST   /requests                   → publier une demande [auth]
DELETE /requests/{id}              → supprimer sa demande [auth, owner]
 
─── RECHERCHE ─────────────────────────────────────────────
GET    /search                     → recherche full-text + filtres
 
─── WEB PREVIEW (HTML, pas JSON) ──────────────────────────
GET    /a/{listingId}              → page preview annonce
GET    /u/{username}               → page profil vendeur
```
 
---
 
## Détail des routes
 
### POST /auth/register
```
Body:
  email        : string, required, email, unique
  password     : string, required, min:8, confirmed
  display_name : string, required, max:80
  username     : string, nullable, unique, regex:/^[a-z0-9_]{3,30}$/
 
Response 201:
  {
    "token": "...",
    "user": { id, email, display_name, username, photo_url, ... }
  }
 
Logique:
  → Hash password (bcrypt)
  → Créer User
  → Créer token Sanctum
  → Retourner token + user
```
 
### POST /auth/login
```
Body:
  email    : string, required
  password : string, required
 
Response 200:
  { "token": "...", "user": {...} }
 
Response 401:
  { "message": "Identifiants incorrects" }
 
Logique:
  → Auth::attempt()
  → Mettre à jour last_seen_at
  → Créer token Sanctum
```
 
### GET /listings (feed principal)
```
Query params:
  page       : int (défaut 1)
  per_page   : int (défaut 20, max 50)
  category   : string (optionnel)
  type       : VENTE|TROC|TROC_CASH (optionnel)
  condition  : neuf|excellent|bon|correct (optionnel)
  country    : string (optionnel)
  city       : string (optionnel)
  min_price  : int (optionnel)
  max_price  : int (optionnel)
 
Response 200:
  {
    "data": [ ListingResource ],
    "meta": { current_page, last_page, total, per_page }
  }
 
Logique:
  SELECT * FROM listings
  WHERE status = 'active'
  AND (category = ? OR ? IS NULL)
  AND (type = ? OR ? IS NULL)
  ...
  ORDER BY is_boosted DESC, created_at DESC
  LIMIT ? OFFSET ?
```
 
### POST /listings
```
Body (multipart/form-data):
  title        : string, required, min:5, max:80
  description  : string, required, min:20, max:500
  type         : VENTE|TROC|TROC_CASH, required
  price        : int, required_if:type,VENTE
  cash_complement: int, nullable
  exchange_for : string, required_if:type,TROC|TROC_CASH
  category     : string, required
  condition    : neuf|excellent|bon|correct, required
  delivery_mode: main_propre|livraison|les_deux, required
  country      : string, required
  city         : string, required
  neighborhood : string, required
  tags         : array, nullable
  photos[]     : files, required, min:1, max:10, mimes:jpg,jpeg,png,webp, max:5120kb chacune
 
Response 201:
  { "data": ListingResource }
 
Logique:
  → Valider via StoreListingRequest
  → Compresser + upload chaque photo → Storage
  → Créer Listing avec title_search = strtolower(title)
  → expires_at = now() + 30 jours
  → Si type TROC/TROC_CASH : vérifier exchange_for présent
  → Déclencher Job: CheckRequestMatches(listing)
  → Retourner ListingResource
```
 
### POST /conversations
```
Body:
  listing_id : UUID, required
  message    : string, required, max:1000
 
Response 201:
  { "data": ConversationResource, "message": MessageResource }
 
Logique:
  → Récupérer listing → vérifier status = active
  → Vérifier que buyer != seller
  → conv_id = min(auth_uid, owner_uid) . '_' . max(auth_uid, owner_uid) . '_' . listing_id
  → findOrCreate Conversation
  → Créer premier Message
  → Mettre à jour last_message, last_message_at, unread
  → Déclencher Job: SendPushNotification(type: new_message, ...)
```
 
### POST /conversations/{id}/messages
```
Body (multipart/form-data):
  type         : text|image|troc_proposal, required
  text         : string, required_if:type,text, max:1000
  image        : file, required_if:type,image, mimes:jpg,jpeg,png, max:5120kb
  -- Si type = troc_proposal:
  offered_listing_id    : UUID, required
  cash_amount           : int, nullable
 
Response 201:
  { "data": MessageResource }
 
Logique:
  → Vérifier auth est participant
  → Si image → upload Storage
  → Si troc_proposal → vérifier offered_listing appartient à l'auteur
  → INSERT message
  → UPDATE conversation (last_message, unread +1)
  → Job: SendPushNotification(type: new_message|troc_proposal)
```
 
### POST /transactions
```
Body:
  listing_id  : UUID, required
  buyer_id    : UUID, required
  type        : VENTE|TROC|TROC_CASH, required
  final_price : int, nullable
 
Response 201:
  { "data": TransactionResource }
 
Logique:
  → Vérifier auth = seller (owner de la listing)
  → Vérifier listing.status = active
  → UPDATE listings SET status = 'sold'
  → INSERT transaction
  → Job: SendPushNotification(buyer_id, type: transaction_done)
  → INSERT notification pour buyer et seller
```
 
### POST /reviews
```
Body:
  transaction_id : UUID, required
  rating         : int, required, min:1, max:5
  comment        : string, nullable, max:300
 
Response 201:
  { "data": ReviewResource }
 
Logique:
  → Vérifier auth est seller ou buyer de la transaction
  → Vérifier qu'aucun avis n'existe déjà (from_uid, transaction_id) → 409 si doublon
  → to_uid = l'autre participant de la transaction
  → INSERT review
  → Recalculer rating de to_uid :
      UPDATE users SET
        rating = (SELECT AVG(rating) FROM reviews WHERE to_uid = ?),
        review_count = (SELECT COUNT(*) FROM reviews WHERE to_uid = ?)
  → UPDATE transaction (seller_reviewed ou buyer_reviewed)
```
 
### GET /search
```
Query params:
  q          : string, required, min:2
  category   : string (optionnel)
  type       : string (optionnel)
  city       : string (optionnel)
  min_price  : int (optionnel)
  max_price  : int (optionnel)
  condition  : string (optionnel)
  page       : int
 
Response 200:
  { "data": [ ListingResource ], "meta": {...} }
 
Logique (MySQL full-text) :
  SELECT * FROM listings
  WHERE status = 'active'
  AND (
    title_search LIKE CONCAT('%', LOWER(?), '%')
    OR description LIKE CONCAT('%', LOWER(?), '%')
    OR JSON_CONTAINS(tags, JSON_QUOTE(?))
  )
  -- Filtres optionnels
  AND (category = ? OR ? IS NULL)
  AND (city LIKE ? OR ? IS NULL)
  AND (price >= ? OR ? IS NULL)
  AND (price <= ? OR ? IS NULL)
  ORDER BY
    CASE WHEN title_search LIKE CONCAT(LOWER(?), '%') THEN 0 ELSE 1 END,  -- préfixe en premier
    is_boosted DESC,
    created_at DESC
  LIMIT 20 OFFSET ?
```
 
### GET /a/{listingId} (web preview)
```
Logique:
  → SELECT listing + user (owner)
  → Si not found → 404 HTML
  → Retourner Blade view avec OG tags :
      <meta property="og:title" content="{{ $listing->title }} — Bizo">
      <meta property="og:description" content="{{ $listing->price }} FCFA · {{ $listing->city }}">
      <meta property="og:image" content="{{ $listing->photos[0] }}">
      <meta property="og:url" content="https://bizo.woopchi.com/a/{{ $listing->id }}">
  → Si app installée → App Link redirige vers ItemDetailScreen
  → Si app absente → page avec bouton Play Store
```
 
---
 
## Modèles Eloquent
 
### User.php
```php
protected $fillable = [
    'email', 'password', 'display_name', 'username', 'bio',
    'photo_url', 'country_code', 'fcm_token', 'is_verified',
    'is_profile_public', 'has_seen_onboarding', 'response_rate',
    'avg_response_time', 'blocked_users', 'saved_searches',
    'notif_messages', 'notif_troc', 'notif_rappels', 'notif_favoris',
];
 
protected $hidden = ['password', 'fcm_token', 'blocked_users'];
 
protected $casts = [
    'blocked_users'    => 'array',
    'saved_searches'   => 'array',
    'is_profile_public'=> 'boolean',
    'notif_messages'   => 'boolean',
    'rating'           => 'float',
];
 
// Relations
public function listings()     { return $this->hasMany(Listing::class, 'owner_id'); }
public function reviews()      { return $this->hasMany(Review::class, 'to_uid'); }
public function favorites()    { return $this->hasMany(Favorite::class); }
public function notifications(){ return $this->hasMany(Notification::class); }
```
 
### Listing.php
```php
protected $fillable = [
    'owner_id', 'title', 'title_search', 'description', 'type',
    'price', 'cash_complement', 'exchange_for', 'category',
    'condition', 'delivery_mode', 'photos', 'country', 'city',
    'neighborhood', 'tags', 'status', 'is_boosted', 'boosted_until',
    'price_history', 'expires_at', 'reminder_sent_at',
];
 
protected $casts = [
    'photos'        => 'array',
    'tags'          => 'array',
    'price_history' => 'array',
    'is_boosted'    => 'boolean',
    'boosted_until' => 'datetime',
    'expires_at'    => 'datetime',
    'reminder_sent_at' => 'datetime',
];
 
// Mutator : title_search auto
public function setTitleAttribute($value) {
    $this->attributes['title'] = $value;
    $this->attributes['title_search'] = strtolower($value);
}
 
// Relations
public function owner()       { return $this->belongsTo(User::class, 'owner_id'); }
public function favorites()   { return $this->hasMany(Favorite::class); }
public function conversations(){ return $this->hasMany(Conversation::class); }
 
// Scope : actives seulement
public function scopeActive($query) { return $query->where('status', 'active'); }
```
 
### Conversation.php
```php
protected $fillable = [
    'id', 'listing_id', 'listing_title', 'listing_photo',
    'participant_1', 'participant_2',
    'last_message', 'last_message_at', 'last_sender_id',
    'unread_p1', 'unread_p2',
];
 
public $incrementing = false; // ID string custom
protected $keyType = 'string';
 
// Retourner le nb de messages non lus pour l'utilisateur courant
public function unreadCountFor(string $uid): int {
    if ($this->participant_1 === $uid) return $this->unread_p1;
    if ($this->participant_2 === $uid) return $this->unread_p2;
    return 0;
}
 
public function messages() { return $this->hasMany(Message::class, 'conv_id'); }
```
 
### Message.php
```php
protected $fillable = [
    'conv_id', 'sender_id', 'type', 'text', 'image_url',
    'offered_listing_id', 'offered_listing_title', 'offered_listing_photo',
    'cash_amount', 'proposal_status', 'refusal_reason', 'is_read',
];
 
protected $casts = ['is_read' => 'boolean'];
 
public function sender() { return $this->belongsTo(User::class, 'sender_id'); }
```
 
---
 
## Migrations MySQL
 
### create_users_table
```php
Schema::create('users', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
    $table->string('email')->unique();
    $table->string('password');
    $table->string('display_name');
    $table->string('username')->unique()->nullable();
    $table->text('bio')->nullable();
    $table->string('photo_url')->nullable();
    $table->string('country_code', 5)->nullable();
    $table->float('rating')->default(0);
    $table->integer('review_count')->default(0);
    $table->integer('total_sales')->default(0);
    $table->string('fcm_token')->nullable();
    $table->boolean('is_verified')->default(false);
    $table->boolean('is_profile_public')->default(true);
    $table->boolean('has_seen_onboarding')->default(false);
    $table->float('response_rate')->nullable();
    $table->integer('avg_response_time')->nullable();
    $table->json('blocked_users')->nullable();
    $table->json('saved_searches')->nullable();
    $table->boolean('notif_messages')->default(true);
    $table->boolean('notif_troc')->default(true);
    $table->boolean('notif_rappels')->default(true);
    $table->boolean('notif_favoris')->default(true);
    $table->timestamp('last_seen_at')->nullable();
    $table->timestamps();
    $table->softDeletes();
});
```
 
### create_listings_table
```php
Schema::create('listings', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
    $table->foreignUuid('owner_id')->constrained('users')->cascadeOnDelete();
    $table->string('title', 80);
    $table->string('title_search', 80);
    $table->text('description');
    $table->enum('type', ['VENTE', 'TROC', 'TROC_CASH']);
    $table->bigInteger('price')->nullable();
    $table->bigInteger('cash_complement')->nullable();
    $table->string('exchange_for')->nullable();
    $table->string('category');
    $table->enum('condition', ['neuf', 'excellent', 'bon', 'correct']);
    $table->enum('delivery_mode', ['main_propre', 'livraison', 'les_deux']);
    $table->json('photos')->nullable();
    $table->string('country', 5);
    $table->string('city');
    $table->string('neighborhood')->nullable();
    $table->json('tags')->nullable();
    $table->integer('view_count')->default(0);
    $table->integer('favorite_count')->default(0);
    $table->enum('status', ['active', 'sold', 'expired', 'draft', 'deleted'])->default('active');
    $table->boolean('is_boosted')->default(false);
    $table->timestamp('boosted_until')->nullable();
    $table->json('price_history')->nullable();
    $table->timestamp('reminder_sent_at')->nullable();
    $table->timestamp('expires_at')->nullable();
    $table->timestamps();
    $table->softDeletes();
 
    $table->index(['status', 'is_boosted', 'created_at']);
    $table->index(['owner_id', 'status']);
    $table->index(['category', 'status']);
    $table->index('title_search');
});
```
 
### create_conversations_table
```php
Schema::create('conversations', function (Blueprint $table) {
    $table->string('id')->primary(); // "{minUid}_{maxUid}_{listingId}"
    $table->foreignUuid('listing_id')->constrained('listings');
    $table->string('listing_title');
    $table->string('listing_photo')->nullable();
    $table->foreignUuid('participant_1')->constrained('users');
    $table->foreignUuid('participant_2')->constrained('users');
    $table->text('last_message')->nullable();
    $table->timestamp('last_message_at')->nullable();
    $table->foreignUuid('last_sender_id')->nullable()->constrained('users');
    $table->integer('unread_p1')->default(0);
    $table->integer('unread_p2')->default(0);
    $table->timestamps();
 
    $table->index(['participant_1', 'last_message_at']);
    $table->index(['participant_2', 'last_message_at']);
});
```
 
### create_messages_table
```php
Schema::create('messages', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
    $table->string('conv_id');
    $table->foreign('conv_id')->references('id')->on('conversations');
    $table->foreignUuid('sender_id')->constrained('users');
    $table->enum('type', ['text', 'image', 'troc_proposal']);
    $table->text('text')->nullable();
    $table->string('image_url')->nullable();
    $table->foreignUuid('offered_listing_id')->nullable()->constrained('listings');
    $table->string('offered_listing_title')->nullable();
    $table->string('offered_listing_photo')->nullable();
    $table->bigInteger('cash_amount')->nullable();
    $table->enum('proposal_status', ['pending', 'accepted', 'refused'])->nullable();
    $table->text('refusal_reason')->nullable();
    $table->boolean('is_read')->default(false);
    $table->timestamps();
 
    $table->index(['conv_id', 'created_at']);
});
```
 
### create_favorites_table
```php
Schema::create('favorites', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
    $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
    $table->foreignUuid('listing_id')->constrained('listings')->cascadeOnDelete();
    $table->string('listing_title');
    $table->string('listing_photo')->nullable();
    $table->bigInteger('listing_price')->nullable();
    $table->string('listing_type');
    $table->timestamps();
 
    $table->unique(['user_id', 'listing_id']);
    $table->index(['user_id', 'created_at']);
});
```
 
### create_transactions_table
```php
Schema::create('transactions', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
    $table->foreignUuid('listing_id')->constrained('listings');
    $table->foreignUuid('seller_id')->constrained('users');
    $table->foreignUuid('buyer_id')->constrained('users');
    $table->enum('type', ['VENTE', 'TROC', 'TROC_CASH']);
    $table->bigInteger('final_price')->nullable();
    $table->boolean('seller_reviewed')->default(false);
    $table->boolean('buyer_reviewed')->default(false);
    $table->timestamps();
});
```
 
### create_reviews_table
```php
Schema::create('reviews', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
    $table->foreignUuid('from_uid')->constrained('users');
    $table->foreignUuid('to_uid')->constrained('users');
    $table->foreignUuid('listing_id')->constrained('listings');
    $table->foreignUuid('transaction_id')->constrained('transactions');
    $table->tinyInteger('rating');
    $table->text('comment')->nullable();
    $table->timestamps();
 
    $table->unique(['from_uid', 'transaction_id']); // un avis par transaction
    $table->index(['to_uid', 'created_at']);
});
```
 
### create_notifications_table
```php
Schema::create('notifications', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
    $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
    $table->string('type');
    $table->string('title');
    $table->text('body');
    $table->json('data')->nullable();
    $table->boolean('is_read')->default(false);
    $table->timestamps();
 
    $table->index(['user_id', 'created_at']);
    $table->index(['user_id', 'is_read']);
});
```
 
### create_reports_table
```php
Schema::create('reports', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
    $table->foreignUuid('from_uid')->constrained('users');
    $table->string('target_type'); // listing | user | message
    $table->uuid('target_id');
    $table->string('reason');      // spam | fake | inappropriate | scam
    $table->string('status')->default('pending');
    $table->timestamps();
 
    $table->index(['status', 'created_at']);
});
```
 
### create_listing_requests_table
```php
Schema::create('listing_requests', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
    $table->foreignUuid('owner_id')->constrained('users')->cascadeOnDelete();
    $table->string('title');
    $table->text('description')->nullable();
    $table->string('category');
    $table->bigInteger('max_price')->nullable();
    $table->string('country');
    $table->string('city');
    $table->enum('status', ['active', 'fulfilled', 'expired'])->default('active');
    $table->timestamp('expires_at')->nullable();
    $table->timestamps();
 
    $table->index(['status', 'category', 'country']);
});
```
 
---
 
## Service FCM (Firebase Cloud Messaging HTTP v1)
 
```php
// app/Services/FcmService.php
 
class FcmService
{
    public function send(string $fcmToken, string $title, string $body, array $data = []): void
    {
        // 1. Obtenir un access token OAuth2 depuis le Service Account
        $accessToken = $this->getAccessToken();
 
        // 2. Envoyer la notification
        Http::withToken($accessToken)
            ->post("https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send", [
                'message' => [
                    'token' => $fcmToken,
                    'notification' => [
                        'title' => $title,
                        'body'  => $body,
                    ],
                    'data' => array_map('strval', $data),
                    'android' => [
                        'priority' => 'high',
                        'notification' => [
                            'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                        ],
                    ],
                ],
            ]);
    }
 
    private function getAccessToken(): string
    {
        // Décoder le JSON du Service Account depuis .env
        // Utiliser google/auth pour générer le JWT et l'échanger contre un token
        // Mettre en cache le token pendant 55 minutes (expire à 60)
        $serviceAccount = json_decode(base64_decode(env('FCM_SERVICE_ACCOUNT_JSON')), true);
        // ... logique JWT OAuth2
    }
}
```
 
### Types de notifications et payloads
 
```php
// Types de data envoyés dans chaque push
 
'new_message'      → [ 'type' => 'new_message',      'conv_id' => $convId ]
'troc_proposal'    → [ 'type' => 'troc_proposal',     'conv_id' => $convId ]
'troc_refused'     → [ 'type' => 'troc_refused',      'conv_id' => $convId ]
'listing_reminder' → [ 'type' => 'listing_reminder',  'listing_id' => $id ]
'listing_expired'  → [ 'type' => 'listing_expired',   'listing_id' => $id ]
'new_favorite'     → [ 'type' => 'new_favorite',      'listing_id' => $id ]
'request_match'    → [ 'type' => 'request_match',     'listing_id' => $id ]
'transaction_done' → [ 'type' => 'transaction_done',  'transaction_id' => $id ]
```
 
---
 
## Jobs (Queue)
 
```php
// app/Jobs/SendPushNotification.php
// dispatch(new SendPushNotification($user, $title, $body, $data))
// → vérifie notif_prefs avant d'envoyer
// → appelle FcmService::send()
// → INSERT INTO notifications
 
// app/Jobs/CleanListingStorage.php
// dispatch(new CleanListingStorage($listingId))
// → supprime tous les fichiers Storage du listing supprimé
 
// app/Jobs/CheckRequestMatches.php
// dispatch(new CheckRequestMatches($listing))
// → cherche les requests/ matchantes (category + country)
// → envoie push à chaque demandeur
```
 
---
 
## Scheduler (Cron Laravel)
 
```php
// app/Console/Kernel.php (ou bootstrap/app.php Laravel 11)
 
Schedule::command('bizo:send-reminders')->hourly();
// → listings WHERE status=active AND created_at BETWEEN (now-4j) AND (now-3j) AND reminder_sent_at IS NULL
// → Envoyer push + mettre reminder_sent_at = now()
 
Schedule::command('bizo:expire-listings')->dailyAt('00:00');
// → UPDATE listings SET status=expired WHERE status=active AND expires_at < now()
// → Envoyer push à chaque vendeur
 
Schedule::command('bizo:expire-requests')->dailyAt('00:05');
// → UPDATE listing_requests SET status=expired WHERE status=active AND expires_at < now()
 
Schedule::command('bizo:update-reactivity-badges')->dailyAt('02:00');
// → Calculer avg_response_time + response_rate par user
// → UPDATE users SET avg_response_time=..., response_rate=...
```
 
---
 
## Middleware SetLastSeenAt
 
```php
// Appliqué sur toutes les routes [auth]
// Met à jour users.last_seen_at si dernière MAJ > 5 minutes
public function handle(Request $request, Closure $next)
{
    if ($user = $request->user()) {
        $fiveMinutesAgo = now()->subMinutes(5);
        if (!$user->last_seen_at || $user->last_seen_at->lt($fiveMinutesAgo)) {
            $user->updateQuietly(['last_seen_at' => now()]);
        }
    }
    return $next($request);
}
```
 
---
 
## Réponses API — Resources
 
### ListingResource
```json
{
  "id": "uuid",
  "title": "iPhone 13 128Go Noir",
  "description": "...",
  "type": "VENTE",
  "price": 185000,
  "category": "electronique",
  "condition": "excellent",
  "delivery_mode": "les_deux",
  "photos": ["https://...jpg", "https://...jpg"],
  "country": "BJ",
  "city": "Cotonou",
  "neighborhood": "Akpakpa",
  "tags": ["apple", "iphone", "128go"],
  "view_count": 42,
  "favorite_count": 7,
  "status": "active",
  "is_boosted": false,
  "price_history": [],
  "expires_at": "2026-06-22T00:00:00Z",
  "created_at": "2026-05-23T10:00:00Z",
  "owner": {
    "id": "uuid",
    "display_name": "Kouassi A.",
    "username": "kouassi",
    "photo_url": "https://...",
    "rating": 4.8,
    "review_count": 12,
    "avg_response_time": 45,
    "is_verified": true
  }
}
```
 
### ConversationResource
```json
{
  "id": "abc_def_listingId",
  "listing_id": "uuid",
  "listing_title": "iPhone 13",
  "listing_photo": "https://...",
  "other_user": {
    "id": "uuid",
    "display_name": "Moussa K.",
    "photo_url": "https://...",
    "last_seen_at": "2026-05-23T09:00:00Z"
  },
  "last_message": "C'est toujours disponible ?",
  "last_message_at": "2026-05-23T09:30:00Z",
  "unread_count": 2,
  "created_at": "2026-05-23T09:00:00Z"
}
```
 
### MessageResource
```json
{
  "id": "uuid",
  "conv_id": "abc_def_listingId",
  "sender_id": "uuid",
  "type": "troc_proposal",
  "text": null,
  "image_url": null,
  "proposal": {
    "offered_listing_id": "uuid",
    "offered_listing_title": "Samsung Galaxy S22",
    "offered_listing_photo": "https://...",
    "cash_amount": 20000,
    "status": "pending",
    "refusal_reason": null
  },
  "is_read": false,
  "created_at": "2026-05-23T09:35:00Z"
}
```
 
---
 
## Codes d'erreur HTTP
 
```
200 → OK
201 → Créé avec succès
204 → Supprimé (no content)
400 → Données invalides (validation error)
401 → Non authentifié
403 → Non autorisé (mauvais propriétaire)
404 → Ressource introuvable
409 → Conflit (ex: avis déjà existant, conversation déjà existante)
422 → Erreur de validation Laravel
429 → Trop de requêtes (rate limiting)
500 → Erreur serveur
```
 
Format erreur standard :
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["L'email est déjà utilisé."],
    "price": ["Le prix est requis pour une vente."]
  }
}
```
 
---
 
## Docker
 
### Dockerfile
```dockerfile
# ─────────────────────────────────────────────
#  Bizo API — Dockerfile (Render Free Plan)
#  FrankenPHP — remplace nginx + php-fpm
#  MySQL via DomCloud (externe)
# ─────────────────────────────────────────────
FROM dunglas/frankenphp:latest-php8.3-alpine
 
# ── Dépendances système ──────────────────────
RUN apk add --no-cache \
    bash \
    curl \
    zip \
    unzip \
    git \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    freetype-dev \
    oniguruma-dev \
    icu-dev \
    libxml2-dev
 
# ── Extensions PHP ───────────────────────────
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
 && docker-php-ext-install \
        pdo \
        pdo_mysql \
        mbstring \
        bcmath \
        pcntl \
        exif \
        gd \
        intl \
        xml \
        opcache
 
# ── Composer ─────────────────────────────────
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
 
# ── Répertoire de travail ─────────────────────
WORKDIR /app
 
# ── Copier le code ────────────────────────────
COPY . .
 
# ── Installer les dépendances PHP ────────────
RUN composer install --no-dev --optimize-autoloader --no-interaction
 
# ── Permissions storage & cache ──────────────
RUN mkdir -p storage/framework/{cache,sessions,views} \
             storage/logs \
             bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache
 
# ── Script de démarrage ───────────────────────
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh
 
# ── Port Render ───────────────────────────────
EXPOSE 10000
 
CMD ["/start.sh"]
```
 
### docker/start.sh
```bash
#!/bin/bash
set -e
 
echo "==> Bizo API - Démarrage container..."
cd /app
 
# Génère la clé si absente
if [ -z "$APP_KEY" ]; then
  echo "==> Génération APP_KEY..."
  php artisan key:generate --force
fi
 
# Attendre que MySQL soit prêt (max 30s)
echo "==> Attente MySQL..."
for i in $(seq 1 15); do
  php artisan db:monitor --max=1 2>/dev/null && break || true
  echo "   MySQL pas encore prêt, attente 2s... ($i/15)"
  sleep 2
done
 
# Migrations
echo "==> Migrations..."
php artisan migrate --force --no-interaction
 
# Symlink storage public
echo "==> Storage link..."
php artisan storage:link --force 2>/dev/null || true
 
# Cache Laravel
echo "==> Cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
 
chown -R www-data:www-data storage bootstrap/cache
 
# Queue worker en arrière-plan
echo "==> Démarrage queue worker..."
php artisan queue:work --sleep=5 --tries=3 --timeout=90 --max-time=3600 &
 
# Scheduler en arrière-plan
echo "==> Démarrage scheduler..."
while true; do php artisan schedule:run --no-interaction; sleep 60; done &
 
# FrankenPHP au premier plan (processus principal)
echo "==> Démarrage FrankenPHP..."
exec frankenphp run --config /etc/caddy/Caddyfile
```
 
### docker-compose.yml (développement local)
```yaml
version: '3.8'
 
services:
  app:
    build: .
    ports:
      - "8000:10000"
    volumes:
      - .:/app
    depends_on:
      - db
    environment:
      - DB_HOST=db
      - DB_PORT=3306
      - DB_DATABASE=bizowoop
      - DB_USERNAME=bizowoop
      - DB_PASSWORD=secret
 
  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: bizowoop
      MYSQL_USER: bizowoop
      MYSQL_PASSWORD: secret
      MYSQL_ROOT_PASSWORD: secret
    ports:
      - "3306:3306"
    volumes:
      - mysqldata:/var/lib/mysql
 
volumes:
  mysqldata:
```
 
### render.yaml (déploiement Render)
```yaml
services:
  - type: web
    name: bizo-api
    runtime: docker
    dockerfilePath: ./Dockerfile
    plan: free
    # Render Free : le container se met en veille après inactivité
    # Pas de volume persistant → fichiers uploadés perdus au redeploy (comportement accepté)
    envVars:
      - key: APP_NAME
        value: BizoAPI
      - key: APP_ENV
        value: production
      - key: APP_DEBUG
        value: false
      - key: APP_URL
        value: http://0.0.0.0
      - key: APP_KEY
        generateValue: true
 
      # ── Base de données MySQL (DomCloud externe) ──
      - key: DB_CONNECTION
        value: mysql
      - key: DB_HOST
        value: mnz.domcloud.co
      - key: DB_PORT
        value: 3306
      - key: DB_DATABASE
        value: bizowoop
      - key: DB_USERNAME
        value: bizowoop
      - key: DB_PASSWORD
        sync: false   # À renseigner dans le dashboard Render (secret)
 
      # ── Storage ───────────────────────────────────
      - key: FILESYSTEM_DISK
        value: local
 
      # ── Queue / Cache ─────────────────────────────
      - key: QUEUE_CONNECTION
        value: database
      - key: CACHE_DRIVER
        value: database
 
      # ── CORS ouvert ───────────────────────────────
      - key: FRONTEND_URL
        value: "*"
      - key: SANCTUM_STATEFUL_DOMAINS
        value: "*"
 
      # ── Firebase FCM ─────────────────────────────
      - key: FCM_PROJECT_ID
        value: bizo-f2187
      - key: FCM_SERVICE_ACCOUNT_JSON
        sync: false   # JSON base64 du compte de service Firebase
# Note : pas de section "databases:" — on utilise MySQL DomCloud externe
```
 
---
 
## Commandes de démarrage
 
```bash
# Développement local
git clone https://github.com/woopchi/bizo-api
cd bizo-api
cp .env.example .env
docker-compose up -d
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed  # données de test
 
# Vérifier que l'API répond
curl http://localhost:8000/api/v1/listings
 
# Déploiement Render
# 1. Push sur GitHub
# 2. Connecter le repo sur render.com → New Web Service
# 3. Render détecte render.yaml et déploie automatiquement
# 4. Dans le dashboard Render, ajouter les 2 secrets :
#    - DB_PASSWORD      → dKRKaw1Jq6c619U+_)
#    - FCM_SERVICE_ACCOUNT_JSON → la chaîne base64 Firebase (voir ci-dessous)
# 5. start.sh exécute automatiquement : php artisan migrate --force
```
 
---
 
## Configuration Firebase FCM
 
### Étapes à suivre une seule fois
 
```
1. Aller sur https://console.firebase.google.com → projet bizo-f2187
2. Paramètres du projet (⚙️) → onglet "Comptes de service"
3. Cliquer "Générer une nouvelle clé privée" → télécharge un fichier .json
4. Encoder ce fichier en base64 (sur Mac/Linux) :
     base64 -w 0 bizo-f2187-firebase-adminsdk-xxxxx.json
5. Copier la longue chaîne obtenue
6. Dans le dashboard Render → Environment → ajouter :
     FCM_SERVICE_ACCOUNT_JSON = <la chaîne base64>
```
 
### Dans le code Laravel (FcmService.php)
Le JSON est lu depuis l'env :
```php
$serviceAccount = json_decode(base64_decode(env('FCM_SERVICE_ACCOUNT_JSON')), true);
```
Installer le package Google Auth :
```bash
composer require google/auth
```
 
---
 
## Ordre d'implémentation pour l'IA
 
```
Phase 1 — Setup initial
  1. Créer projet Laravel 11
  2. Configurer Dockerfile + docker-compose.yml
  3. Configurer render.yaml
  4. Créer toutes les migrations (dans l'ordre : users → listings → conversations → messages → favorites → transactions → reviews → notifications → reports → listing_requests)
  5. Créer tous les Models avec relations et casts
  6. Configurer Sanctum
 
Phase 2 — Auth
  7. AuthController (register, login, logout, password reset)
  8. Tests : POST /auth/register, POST /auth/login
 
Phase 3 — Annonces
  9.  ListingController (index, store, show, update, destroy)
  10. StorageService (upload, delete, compression)
  11. StoreListingRequest (validation complète)
  12. ListingResource
  13. Tests : CRUD listings
 
Phase 4 — Social
  14. ConversationController + ConversationService (convId generation)
  15. MessageController (list, send, marquer lu)
  16. FcmService + SendPushNotification Job
  17. TransactionController
  18. ReviewController
  19. FavoriteController
 
Phase 5 — Notifications & Scheduler
  20. NotificationController
  21. Commands : SendListingReminders, ExpireListings, UpdateReactivityBadges
  22. Scheduler config
 
Phase 6 — Recherche & Extras
  23. SearchController (GET /search)
  24. ReportController
  25. RequestController (Je cherche)
  26. CheckRequestMatches Job
 
Phase 7 — Web Preview
  27. WebPreviewController
  28. Blade templates listing.blade.php + seller.blade.php
  29. Android App Links : /.well-known/assetlinks.json
 
Phase 8 — Finition
  30. Rate limiting (throttle middleware)
  31. SetLastSeenAt middleware
  32. ProfileController (update, avatar, delete account)
  33. CORS configuration
  34. API documentation (Scribe ou L5-Swagger)
```
 
---
 
*© 2026 Woopchi Digital — Marc & Adechina BOUKARI — Confidentiel*
 


