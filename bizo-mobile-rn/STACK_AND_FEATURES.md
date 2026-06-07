# Bizo Mobile RN

## Stack verrouillee

- Expo
- React Native
- TypeScript
- Expo Router
- React Query
- Zustand
- Axios
- React Hook Form
- Zod
- expo-image
- expo-image-picker
- expo-secure-store
- @shopify/flash-list
- react-native-reanimated
- react-native-gesture-handler
- react-native-safe-area-context
- expo-dev-client
- expo-notifications
- expo-file-system
- expo-haptics
- expo-sharing
- expo-location
- expo-camera
- react-native-maps
- NativeWind

## Fonctionnalites a remettre en place

### Auth

- onboarding
- sign in
- register
- forgot password
- create new password
- secure token storage

### Browse

- home
- category
- search
- filter
- favorites
- listing detail

### Publishing

- choix categorie
- upload photos
- item detail
- title and description
- location
- success state

### Messaging

- inbox
- conversation
- unread badge
- realtime websocket sur backend Laravel/Reverb

### Account

- profile
- my ads
- favorites
- settings

## Ecrans design source

La reference principale est :

- `design-reference/classified-ai/ecran`

Priorite ecran par ecran :

1. entry-auth
2. browse-discovery
3. detail
4. posting
5. chat
6. account-seller

## Build serveur vise

- image Docker dediee Expo Android : `bizo-mobile-rn/Dockerfile.android`
- script serveur dedie : `scripts/build-mobile-expo-apk.sh`
- les workflows Android GitHub Actions se declenchent sur les changements dans `bizo-mobile-rn/**`
- sortie attendue :
  - `/home/admin/bizo-storage/mobile-builds/latest/app-debug.apk`
  - `/home/admin/bizo-storage/mobile-builds/releases/...apk`

## Pourquoi tout est installe des maintenant

Le but est d'eviter les rebuilds repetes du dev client a chaque ajout de module natif.

Ce qui est deja embarque :

- camera
- location
- notifications
- image picker
- secure storage
- maps
- filesystem
- sharing
- animations
- gesture handling
