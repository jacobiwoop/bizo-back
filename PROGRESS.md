# Bizo Backend - Suivi d'avancement

Ce fichier sert de feuille de route operative pour suivre l'evolution du backend Bizo a partir de `bizo-backend-spec.md`.

## Etat actuel

- Statut global: `phase 7 terminee`
- Phase en cours: `Phase 8 - Finition`
- Prochaine tache prioritaire: `Configurer rate limiting et SetLastSeenAt`
- Derniere mise a jour: `2026-05-24`

## Decisions verrouillees

- Base de donnees: `MySQL`
- Backend: `Laravel 11`
- Auth API: `Laravel Sanctum`
- Queue: `database`
- Storage: `local en dev`
- Deploiement cible: `Render`

## Regles de suivi

- Remplacer `[ ]` par `[x]` quand une tache est terminee.
- Mettre a jour `Statut global`, `Phase en cours` et `Prochaine tache prioritaire` a chaque avancee importante.
- Ajouter les blocages ou decisions nouvelles dans la section `Journal`.

## Checklist par phase

### Phase 1 - Setup initial

- [x] Creer projet Laravel 11
- [x] Configurer `Dockerfile`
- [x] Configurer `docker-compose.yml`
- [x] Configurer `render.yaml`
- [x] Creer migration `users`
- [x] Creer migration `listings`
- [x] Creer migration `conversations`
- [x] Creer migration `messages`
- [x] Creer migration `favorites`
- [x] Creer migration `transactions`
- [x] Creer migration `reviews`
- [x] Creer migration `notifications`
- [x] Creer migration `reports`
- [x] Creer migration `listing_requests`
- [x] Creer model `User`
- [x] Creer model `Listing`
- [x] Creer model `Conversation`
- [x] Creer model `Message`
- [x] Creer model `Favorite`
- [x] Creer model `Review`
- [x] Creer model `Transaction`
- [x] Creer model `Notification`
- [x] Creer model `Report`
- [x] Creer model `ListingRequest`
- [x] Configurer relations et casts Eloquent
- [x] Configurer Sanctum

### Phase 2 - Auth

- [x] Creer `AuthController`
- [x] Implementer `register`
- [x] Implementer `login`
- [x] Implementer `logout`
- [x] Implementer `password reset`
- [x] Ajouter tests `POST /auth/register`
- [x] Ajouter tests `POST /auth/login`

### Phase 3 - Annonces

- [x] Creer `ListingController`
- [x] Implementer `index`
- [x] Implementer `store`
- [x] Implementer `show`
- [x] Implementer `update`
- [x] Implementer `destroy`
- [x] Creer `StorageService`
- [x] Implementer upload photos
- [x] Implementer suppression photos
- [x] Implementer compression images
- [x] Creer `StoreListingRequest`
- [x] Creer `ListingResource`
- [x] Ajouter tests CRUD listings

### Phase 4 - Social

- [x] Creer `ConversationController`
- [x] Creer `ConversationService`
- [x] Implementer generation `conv_id`
- [x] Creer `MessageController`
- [x] Implementer liste messages
- [x] Implementer envoi message
- [x] Implementer marquage lu
- [x] Creer `FcmService`
- [x] Creer job `SendPushNotification`
- [x] Creer `TransactionController`
- [x] Creer `ReviewController`
- [x] Creer `FavoriteController`
- [x] Ajouter tests Phase 4

### Phase 5 - Notifications et Scheduler

- [x] Creer `NotificationController`
- [x] Creer commande `SendListingReminders`
- [x] Creer commande `ExpireListings`
- [x] Creer commande `UpdateReactivityBadges`
- [x] Configurer scheduler Laravel

### Phase 6 - Recherche et extras

- [x] Creer `SearchController`
- [x] Implementer `GET /search`
- [x] Creer `ReportController`
- [x] Creer `RequestController`
- [x] Creer job `CheckRequestMatches`

### Phase 7 - Web Preview

- [x] Creer `WebPreviewController`
- [x] Creer vue `listing.blade.php`
- [x] Creer vue `seller.blade.php`
- [x] Ajouter `/.well-known/assetlinks.json`

### Phase 8 - Finition

- [ ] Configurer rate limiting
- [ ] Creer middleware `SetLastSeenAt`
- [ ] Creer `ProfileController`
- [ ] Implementer mise a jour profil
- [ ] Implementer upload avatar
- [ ] Implementer suppression compte
- [ ] Configurer CORS
- [ ] Ajouter documentation API

## Journal

### 2026-05-24

- Spec backend lue.
- Decision confirmee: la base de donnees du projet est `MySQL`.
- Fichier de suivi cree.
- Projet Laravel 11 initialise a la racine du repo.
- `Sanctum` installe et publie.
- Migrations metier Phase 1 creees avec `UUID`.
- Modeles Eloquent de base crees avec relations et casts.
- Fichiers `Dockerfile`, `docker-compose.yml`, `render.yaml` et `docker/start.sh` ajoutes.
- Verification OK sur `php artisan route:list`.
- Verification OK sur la syntaxe PHP des nouveaux fichiers.
- Connexion Laravel verifiee sur la base MySQL distante `bizowoop_db`.
- Toutes les migrations ont ete executees avec succes sur la base distante.
- `docker/start.sh` aligne sur `db:monitor`.
- Casts numeriques completes dans `User`.
- Relation `conversation()` ajoutee dans `Message`.
- Dossier temporaire `bizo-api-temp` supprime.
- Verification de la Phase 2 effectuee sur le code et les routes.
- Correction du test auth casse sur `username = null`.
- `logout()` rendu plus robuste quand aucun token courant n'est present.
- `forgotPassword` rendu plus discret pour eviter l'enumeration des comptes.
- Route nommee `password.reset` ajoutee pour le flux de notification Laravel.
- Tests ajoutes pour `forgotPassword` et `resetPassword`.
- Suite `AuthTest` validee: `18 passed`.
- Corrections Phase 3 appliquees sur `ListingController` et `Listing`.
- Mutateur `title_search` reverifie au runtime.
- Validation de `update()` alignee avec les regles metier `VENTE` / `TROC`.
- `show()` renvoie maintenant le `view_count` incremente.
- `uploadPhotos()` rejette desormais clairement les uploads qui depassent 10 photos.
- Phase 3 validee: `24 passed` sur `ListingTest`.
- Phase 2 confirmee: `18 passed` sur `AuthTest`.
- Total Phases 1-3: `42 tests, 0 echec`. Tous les warnings PHP sont des extensions dupliquees/manquantes sans impact.
- `FcmService` corrige pour utiliser `google/auth`.
- Endpoint backend ajoute pour enregistrer `fcm_token` depuis l application mobile.
- Routes Social branchees: conversations, messages, transactions, reviews, favorites.
- Controleurs Social ajoutes et verifies par syntaxe.
- Modeles Social UUID completes pour les creations applicatives.
- Tests Feature Phase 4 ajoutes dans `SocialTest` pour conversations, messages, transactions, reviews et favorites.
- Phase 4 validee: `11 passed` sur `SocialTest`.
- Total Phases 2-4: `53 tests` valides (`AuthTest` 18, `ListingTest` 24, `SocialTest` 11).
- Phase 5 amorcee: `NotificationController`, commandes scheduler et routes notifications ajoutes.
- Tests Phase 5 ajoutes: `NotificationsTest` et `SchedulerCommandsTest`.
- Phase 5 validee localement: `6 passed` (`NotificationsTest` 3, `SchedulerCommandsTest` 3).
- Phase 6 amorcee: `SearchController` et route `GET /search` ajoutes.
- Phase 6 recherche validee: `5 passed` sur `SearchTest`.
- Phase 6 extras implementes: `ReportController`, `RequestController`, `CheckRequestMatches`, resources et routes associees ajoutes.
- Verification syntaxe OK sur les nouveaux fichiers Phase 6 extras.
- Phase 6 extras valides: `5 passed` sur `ExtrasTest`.
- Phase 7 implementee: previews web `/a/{listingId}`, `/u/{username}` et `/.well-known/assetlinks.json` ajoutes.
- Correction de la configuration test: `APP_KEY` definie dans `phpunit.xml` pour la pile web Laravel.
- Phase 7 validee: `4 passed` sur `WebPreviewTest`.
- Total Phases 2-7: `73 tests` valides.

## Blocages

- L'environnement PHP local charge encore des extensions manquantes ou dupliquees (`gmp`, `pgsql`, `sodium`, `curl`, `fileinfo`, `mbstring`, `zip`).
- Dans cet environnement d'execution, les suites Phase 5 via `artisan test` retombent encore sur un `SIGILL` (`signal 4`) avant de produire un verdict metier lisible.
- Dans cet environnement d'execution, `artisan test` et `phpunit` direct sur `SocialTest` tombent encore sur un `SIGILL` / exit `132`.
