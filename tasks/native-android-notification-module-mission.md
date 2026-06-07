# Mission IA — Module Android natif pour notifications Bizo custom

## Contexte

Le projet Bizo est dans `/home/aiko/Documents/bizo-back`.

Application mobile React Native/Expo:

- Racine mobile: `bizo-mobile-rn/`
- Package Android production: `io.bizo.woop`
- Package Android dev client: `io.bizo.woop.dev`
- Expo prebuild est lance en CI avec `npx expo prebuild --platform android --no-install --clean`.
- Donc toute modification native Android doit survivre au prebuild clean. Ne pas compter sur une edition manuelle durable de `bizo-mobile-rn/android/` uniquement.

Backend Laravel:

- Racine backend: `/home/aiko/Documents/bizo-back`
- API prod: `https://bizo.aiko.qzz.io/api/v1`
- Les messages push sont deja envoyes en FCM data-only pour les messages.

Probleme actuel:

La notification message utilise actuellement Notifee `AndroidStyle.MESSAGING`. Elle fonctionne fonctionnellement, mais le rendu Android reel ne correspond pas a la representation voulue:

- la zone avatar a gauche devient une petite icone grise systeme;
- le carre avatar 52x52 avec coins arrondis n'est pas controle;
- le bouton expand/collapse est celui du systeme;
- le layout, les espacements et les radius sont imposes par Android/Notifee.

Objectif de cette mission: creer un module Android natif personnalise pour afficher les notifications de messages Bizo avec `RemoteViews`, afin de se rapprocher fortement du design Bizo/Telegram-like.

## Fichiers a lire avant de coder

### Mobile notification actuelle

- `bizo-mobile-rn/src/features/notifications/native-message-notifications.ts`
  - Recoit les FCM data-only.
  - Filtre `type === "new_message"` ou `type === "troc_proposal"`.
  - Appelle actuellement `notifee.displayNotification(...)`.
  - C'est le point d'integration JS a modifier pour appeler le nouveau module natif.

- `bizo-mobile-rn/index.js`
  - Importe le handler notification avant `expo-router/entry`.
  - Important pour le background handler Firebase.

- `bizo-mobile-rn/src/features/notifications/register-push-notifications.ts`
  - Enregistre le FCM token Android via React Native Firebase.

### Representation UI de reference

- `bizo-mobile-rn/src/features/discovery/screens/discovery-notification-screen.tsx`
  - Page `/notification`, accessible depuis la cloche Home.
  - Contient les representations visuelles:
    - notification individuelle compacte;
    - notification individuelle etendue au clic;
    - notification groupee compacte;
    - notification groupee etendue au clic.
  - Ce fichier est la reference UX visuelle, mais ce n'est pas la vraie notification systeme.

- `claude-info.md`
  - Fichier de spec fourni par l'utilisateur.
  - Contient les dimensions/marges de la notification individuelle et groupee.
  - Il peut etre non suivi Git; lire le fichier local s'il est present.

### Backend payload push

- `app/Services/FcmService.php`
  - Construit l'appel FCM.
  - Les messages ont `dataOnly = true`.
  - Le payload data contient `title`, `body`, `image_url`, `notification_avatar_url`.

- `app/Jobs/SendPushNotification.php`
  - Job Laravel qui appelle `FcmService`.

- `app/Http/Controllers/ConversationController.php`
- `app/Http/Controllers/MessageController.php`
  - Construisent `messagePushData(...)` avec:
    - `type`
    - `conv_id`
    - `body`
    - `title`
    - `sender_id`
    - `sender_name`
    - `sender_photo_url`
    - `listing_title`
    - `listing_photo_url`

- `app/Models/Conversation.php`
  - Methode `messageNotificationImageFor(...)`.
  - Regle image:
    - si le vendeur recoit un message acheteur: image = photo de profil de l'acheteur;
    - si l'acheteur recoit une reponse vendeur: image = photo de l'article, fallback photo vendeur.

### Plugins Expo natifs existants

- `bizo-mobile-rn/plugins/with-native-startup-animation.js`
  - Exemple de plugin Expo local qui modifie Android apres prebuild.
  - Utilise `withAppBuildGradle` et `withDangerousMod`.
  - S'en inspirer pour injecter des fichiers Kotlin/XML/drawables et modifier `MainApplication.kt`.

- `bizo-mobile-rn/plugins/with-firebase-notification-color-replace.js`
  - Exemple de plugin AndroidManifest.

- `bizo-mobile-rn/app.json`
  - Ajouter le nouveau plugin ici.
  - Attention: le workflow production retire des plugins non listes dans `keepPlugins`.

### Workflows GitHub Actions

- `.github/workflows/expo-android-debug.yml`
- `.github/workflows/expo-android-production.yml`
- `.github/workflows/emulator.yml`

Important:

- Les workflows font `expo prebuild --clean`.
- Si un nouveau plugin local est ajoute, il doit etre preserve dans le step `Strip unused production Expo modules` de `.github/workflows/expo-android-production.yml`.
- Il faut aussi verifier l'emulator workflow si necessaire.

## Etat technique actuel

Dependances mobiles deja installees:

- `@notifee/react-native`
- `@react-native-firebase/app`
- `@react-native-firebase/messaging`

Notification actuelle:

- FCM data-only arrive dans RNFirebase.
- `displayNativeMessageNotification(remoteMessage)` est appele foreground/background.
- Notifee affiche une notification `MESSAGING`.

Limite observee en vrai sur telephone:

- Capture ADB: `/tmp/bizo-screens/prod-native-notification-compare.png`
- La notification affiche:
  - texte OK: `jacobi • 1 min`;
  - message OK;
  - icone gauche incorrecte: petite icone grise systeme;
  - avatar carre absent;
  - layout non conforme a la representation.

## Objectif produit

Créer une vraie notification Android custom pour les messages Bizo.

### Notification individuelle compacte

Design cible:

- Container sombre `#1A1A1A`.
- Coins arrondis visuels proches de 16px.
- Avatar gauche carre arrondi:
  - 52x52dp environ;
  - radius 10dp;
  - image profil si disponible;
  - initiales si pas d'image.
- Bloc central:
  - nom expediteur blanc/bold;
  - timestamp gris;
  - message preview gris, 1 ligne.
- Droite:
  - bouton rond sombre avec chevron down.

### Notification individuelle etendue

Au mode etendu:

- Meme message, mais texte complet sur plusieurs lignes.
- Ne pas afficher plusieurs conversations ici.
- Le chevron devient up si possible.

### Notification groupee compacte

Design cible inspire de la capture utilisateur type Telegram/WhatsApp:

- Header:
  - logo/app Bizo a gauche;
  - texte `Bizo • X messages de Y discussions • 2 min`;
  - chevron a droite.
- Sous le header:
  - quelques conversations compactes;
  - avatar carre arrondi;
  - nom en blanc;
  - preview en gris/blanc;
  - 1 ligne par conversation.

### Notification groupee etendue

Au mode etendu:

- Header identique avec chevron up.
- Liste de conversations plus detaillee:
  - avatar plus grand;
  - nom + timestamp;
  - message preview;
  - chevron individuel a droite.

## Architecture recommandee

### 1. Garder FCM data-only

Ne pas revenir a FCM `notification` block pour les messages.

Raison:

- FCM notification block laisse Android afficher une notif systeme standard automatiquement.
- On veut garder le controle et eviter les doublons.

### 2. Ajouter un module Android natif

Nom suggere:

- JS: `BizoMessageNotification`
- Kotlin package: `io.bizo.mobile.notifications`

API JS souhaitee:

```ts
type BizoNativeMessageNotificationPayload = {
  type: "new_message" | "troc_proposal";
  conv_id?: string;
  conversation_id?: string;
  title?: string;
  body?: string;
  sender_id?: string;
  sender_name?: string;
  sender_photo_url?: string;
  notification_avatar_url?: string;
  listing_title?: string;
  listing_photo_url?: string;
};

BizoMessageNotification.show(payload);
```

Option:

- `BizoMessageNotification.cancelConversation(conversationId)`
- `BizoMessageNotification.markAsRead(conversationId)` plus tard, si on ajoute action.

### 3. Remplacer l'appel Notifee pour les messages uniquement

Dans `bizo-mobile-rn/src/features/notifications/native-message-notifications.ts`:

- Garder `isMessagePush(...)`.
- Garder `conversationIdFrom(...)`.
- Au lieu de `notifee.displayNotification(...)`, appeler le module natif Android.
- Garder Notifee pour les notifications non-message si le projet en a besoin ailleurs.

Ne pas casser:

- `messaging().setBackgroundMessageHandler(...)`
- `registerForegroundNativeMessageNotifications()`
- FCM token registration.

### 4. Integration Expo prebuild

Comme `expo prebuild --clean` est utilise, il faut une integration durable.

Approche recommandee:

- Creer un plugin local:
  - `bizo-mobile-rn/plugins/with-bizo-message-notifications.js`
- Le plugin doit:
  - copier/injecter les fichiers Kotlin du module;
  - copier/injecter les layouts XML `RemoteViews`;
  - copier/injecter les drawables XML;
  - modifier `MainApplication.kt` pour ajouter le package React Native si module classique;
  - ajouter eventuellement une permission/receiver dans AndroidManifest si besoin pour actions expand/mark-read.

Pattern a suivre:

- `bizo-mobile-rn/plugins/with-native-startup-animation.js`

Ne pas seulement modifier `bizo-mobile-rn/android/` sans plugin, car le prebuild clean peut effacer le travail.

### 5. Module natif possible

Deux options acceptables:

#### Option A — React Native NativeModule classique

Creer:

- `BizoMessageNotificationModule.kt`
- `BizoMessageNotificationPackage.kt`

Modifier `MainApplication.kt` via plugin:

```kotlin
PackageList(this).packages.apply {
  add(BizoMessageNotificationPackage())
}
```

#### Option B — Expo Module local

Possible aussi si l'agent maitrise Expo Modules.

Mais attention:

- L'autolinking local module peut etre plus long a configurer.
- Le module classique injecte par plugin est probablement plus direct dans ce projet.

## Implementation Android attendue

### Layouts XML

Creer des layouts dans:

- `android/app/src/main/res/layout/bizo_notification_message_compact.xml`
- `android/app/src/main/res/layout/bizo_notification_message_expanded.xml`
- `android/app/src/main/res/layout/bizo_notification_group_compact.xml`
- `android/app/src/main/res/layout/bizo_notification_group_expanded.xml`

Ces fichiers doivent etre generes/copied par plugin.

Les layouts doivent utiliser `RemoteViews` compatible:

- Eviter les vues non supportees par RemoteViews.
- Utiliser `LinearLayout`, `RelativeLayout` ou `FrameLayout` simples.
- Utiliser `TextView`, `ImageView`.
- Pour les boutons, utiliser `ImageView`/`TextView` cliquable avec `PendingIntent` si vraiment necessaire.

Attention:

- `RemoteViews` ne supporte pas tout ce qu'une vue Android normale supporte.
- Les coins arrondis sur image distante ne sont pas automatiques.

### Drawables XML

Prevoir:

- background container sombre arrondi;
- background avatar fallback;
- background bouton chevron;
- icone chevron down/up vector drawable;
- icone Bizo notification si necessaire.

### Avatar image

Besoin:

- Si `notification_avatar_url` ou `sender_photo_url` existe, afficher l'image.
- Sinon afficher initiales.

Implementation:

- Telecharger l'image en Kotlin hors UI thread.
- Transformer en bitmap carre avec coins arrondis.
- `RemoteViews.setImageViewBitmap(...)`.
- En cas d'echec reseau/image, fallback initiales.

Important:

- Ne pas bloquer le handler FCM trop longtemps.
- Prevoir timeout raisonnable.
- La notification doit quand meme s'afficher avec initiales si l'image ne charge pas.

### NotificationCompat

Utiliser:

```kotlin
NotificationCompat.Builder(context, "bizo-alerts")
  .setSmallIcon(R.drawable.notification_icon)
  .setContentTitle(senderName)
  .setContentText(body)
  .setStyle(NotificationCompat.DecoratedCustomViewStyle())
  .setCustomContentView(compactRemoteViews)
  .setCustomBigContentView(expandedRemoteViews)
  .setAutoCancel(true)
  .setPriority(NotificationCompat.PRIORITY_HIGH)
  .setCategory(NotificationCompat.CATEGORY_MESSAGE)
```

Channel:

- Reutiliser channel id: `bizo-alerts`
- Importance high.

Notification id:

- Stable par conversation.
- Suggestion:
  - `conversationId.hashCode()`
  - fallback hash de message id/timestamp.

Click notification:

- Ouvrir l'application.
- Si possible, deeplink vers conversation.
- Le payload contient `conv_id`.
- Verifier le routing actuel de conversation dans `bizo-mobile-rn/src/features/chat/` et `app/`.

### Expand/collapse

Important:

- Android gere deja compact vs expanded view via notification shade.
- Le chevron dans la custom view peut etre decoratif si le systeme gere l'expansion.
- Si l'utilisateur exige un bouton vraiment interactif, il faudra:
  - un `BroadcastReceiver`;
  - un `PendingIntent` sur le chevron;
  - stocker `expanded/collapsed`;
  - reconstruire la notification.

Commencer par:

- `setCustomContentView(compact)`
- `setCustomBigContentView(expanded)`

Puis tester si le comportement OS suffit.

Ne pas sur-implementer un receiver avant d'avoir teste.

## Grouped notifications

Phase 1 obligatoire:

- Notification individuelle custom pour un message.

Phase 2 souhaitable:

- Gerer plusieurs messages/conversations en custom group.

Approche:

- Commencer simple: grouper par conversation avec notification id stable.
- Pour un vrai modele "Bizo • X messages de Y discussions", il faut maintenir un etat local des conversations notifiees.
- Cet etat peut etre en SharedPreferences cote Android:
  - `conv_id`
  - sender name
  - body preview
  - timestamp
  - avatar url ou initials.

Si temps limite:

- Implementer d'abord individuelle custom parfaite.
- Documenter group custom comme prochaine iteration.

## Contraintes critiques

- Ne pas casser les notifications existantes non-message.
- Ne pas revenir aux payload FCM notification pour les messages.
- Ne pas supprimer RNFirebase/Notifee si d'autres parties s'en servent.
- Ne pas editer uniquement `android/` sans plugin Expo, car CI prebuild clean peut effacer.
- Garder compat Android 8+.
- Gerer le cas app en foreground et background.
- Gerer absence d'image.
- Gerer echec telechargement avatar.
- Eviter crash headless JS/background.
- Ne pas utiliser des APIs Android necessitant Android 12+ sans fallback.

## Fichiers a creer/modifier suggeres

### A creer

- `bizo-mobile-rn/plugins/with-bizo-message-notifications.js`
- `bizo-mobile-rn/src/features/notifications/bizo-message-notification-module.ts`
- Kotlin genere par plugin, par exemple:
  - `android/app/src/main/java/io/bizo/mobile/notifications/BizoMessageNotificationModule.kt`
  - `android/app/src/main/java/io/bizo/mobile/notifications/BizoMessageNotificationPackage.kt`
  - eventuellement `BizoNotificationActionReceiver.kt`
- XML genere par plugin:
  - `res/layout/bizo_notification_message_compact.xml`
  - `res/layout/bizo_notification_message_expanded.xml`
  - eventuellement layouts group.
- Drawables generees par plugin:
  - `res/drawable/bizo_notification_bg.xml`
  - `res/drawable/bizo_notification_avatar_bg.xml`
  - `res/drawable/bizo_notification_button_bg.xml`
  - `res/drawable/ic_bizo_chevron_down.xml`
  - `res/drawable/ic_bizo_chevron_up.xml`

### A modifier

- `bizo-mobile-rn/app.json`
  - Ajouter `./plugins/with-bizo-message-notifications`.

- `.github/workflows/expo-android-production.yml`
  - Dans `keepPlugins`, ajouter `./plugins/with-bizo-message-notifications`.

- `.github/workflows/emulator.yml`
  - Si un strip plugins similaire existe, ajouter le plugin.

- `bizo-mobile-rn/src/features/notifications/native-message-notifications.ts`
  - Appeler le module natif pour `new_message` et `troc_proposal`.
  - Garder fallback Notifee si module indisponible, utile en dev.

- `tasks/todo.md`
  - Ajouter checklist et review.

- `tasks/lessons.md`
  - Ajouter lecon si une contrainte native est decouverte.

## Tests obligatoires

### Tests code

Dans `bizo-mobile-rn/`:

```bash
npm run typecheck
```

Si possible, prebuild local:

```bash
npx expo prebuild --platform android --no-install --clean
```

Puis verifier que les fichiers natifs sont bien generes.

Si Gradle local disponible:

```bash
cd bizo-mobile-rn/android
./gradlew --no-daemon assembleDebug
```

### Tests CI

Apres push:

- verifier `.github/workflows/expo-android-debug.yml`;
- verifier `.github/workflows/expo-android-production.yml`;
- les deux doivent passer.

### Test notification manuel

Envoyer un message Jacobi -> Desmarc:

```bash
BASE="https://bizo.aiko.qzz.io/api/v1"

TOKEN=$(curl -sS -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"jacobiwoop@gmail.com","password":"Google@doc223"}' \
  | php -r '$j=json_decode(stream_get_contents(STDIN), true); echo $j["token"] ?? $j["data"]["token"] ?? $j["access_token"] ?? "";')
```

Ensuite recuperer la conversation Jacobi/Desmarc et poster un message.

Commande deja utilisee avec succes dans ce repo:

```bash
/usr/bin/zsh -lc 'set -euo pipefail
BASE="https://bizo.aiko.qzz.io/api/v1"
TMP=$(mktemp)
curl -sS -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"jacobiwoop@gmail.com\",\"password\":\"Google@doc223\"}" > "$TMP"
TOKEN=$(php -r '\''$j=json_decode(file_get_contents($argv[1]), true); echo $j["token"] ?? $j["data"]["token"] ?? $j["access_token"] ?? "";'\'' "$TMP")
CONV=$(mktemp)
curl -sS "$BASE/conversations?per_page=50" -H "Authorization: Bearer $TOKEN" > "$CONV"
CONV_ID=$(php -r '\''$j=json_decode(file_get_contents($argv[1]), true); $items=$j["data"] ?? []; foreach ($items as $c) { $s=json_encode($c); if (stripos($s, "desmarcwoop") !== false || stripos($s, "desmarc") !== false) { echo $c["id"] ?? $c["conv_id"] ?? ""; exit; } } echo $items[0]["id"] ?? $items[0]["conv_id"] ?? "";'\'' "$CONV")
BODY="Test notif custom Bizo $(date +%H:%M:%S)"
curl -sS -w "\nHTTP_STATUS:%{http_code}\n" -X POST "$BASE/conversations/$CONV_ID/messages" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"type\":\"text\",\"text\":\"$BODY\"}"
echo "message=$BODY"'
```

### Capture ADB

Telephone deja vu:

- `10.211.35.15:5555`

Commandes:

```bash
adb devices -l
mkdir -p /tmp/bizo-screens
adb -s 10.211.35.15:5555 exec-out screencap -p > /tmp/bizo-screens/custom-native-notification.png
```

Comparer visuellement avec:

- la representation `/notification`;
- les screenshots utilisateur dans la conversation;
- l'ancienne capture `/tmp/bizo-screens/prod-native-notification-compare.png`.

## Critere d'acceptation

La mission est reussie si:

- une notification message Bizo Android apparait avec un layout custom RemoteViews;
- la zone gauche n'est plus la petite icone grise systeme;
- l'avatar est un carre arrondi ou fallback initiales;
- le logo/app reste identifiable;
- le texte compact est tronque proprement;
- la version etendue affiche le texte complet du meme message;
- pas de doublon de notification;
- clic notification ouvre l'app, idealement la conversation;
- app foreground/background testee;
- `npm run typecheck` passe;
- workflows Android debug/prod passent apres push.

## Ce qu'il ne faut pas faire

- Ne pas essayer d'obtenir ce rendu avec Notifee `AndroidStyle.MESSAGING` uniquement: cela a deja ete teste et ne suffit pas sur le telephone de l'utilisateur.
- Ne pas remettre `largeIcon` pour les messages: il peut prendre la place visuelle du logo principal.
- Ne pas casser le FCM data-only.
- Ne pas laisser la production strip supprimer le nouveau plugin.
- Ne pas modifier seulement `android/` sans plugin ou mecanisme de regeneration.

## Notes produit

Le design souhaite n'est pas "zero initiales".

Regle avatar:

- Si photo de profil expediteur disponible: afficher la photo.
- Sinon: afficher les initiales.
- L'avatar doit etre carre avec coins arrondis, pas cercle.

Regle expand:

- Notification individuelle: expand montre le texte complet du meme message.
- Notification groupee: expand montre plusieurs conversations detaillees.

Fin de mission attendue:

- Commits propres et limites.
- Resume clair de ce qui est implemente.
- Captures ADB avant/apres si possible.
- Liste des limites Android restantes si le systeme impose encore un comportement.
