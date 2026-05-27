# Bizo Mobile RN Environment And Launch

## Baseline

- Project path: `bizo-mobile-rn`
- API base URL: `https://bizo.aiko.qzz.io/api/v1`
- Main app entry: `expo-router/entry`
- Design reference: `design-reference/classified-ai/ecran`

## Required local environment

- `nvm` must be available
- Use Node `v20.19.6`
- Do not use Node `22` for local Expo dev on this project

Recommended setup:

```bash
cd /home/aiko/Documents/bizo-back/bizo-mobile-rn
nvm use v20.19.6
node -v
npm -v
```

Expected:

- `node -v` -> `v20.19.6`

## Fresh install

If dependencies need to be rebuilt cleanly:

```bash
cd /home/aiko/Documents/bizo-back/bizo-mobile-rn
nvm use v20.19.6
rm -rf node_modules package-lock.json
npm install
npx expo install --check
```

## Launch local dev client

Start Metro for the installed Expo development build:

```bash
cd /home/aiko/Documents/bizo-back/bizo-mobile-rn
nvm use v20.19.6
npx expo start --dev-client --clear
```

Then on the phone:

1. open the installed Expo development build
2. scan the QR code or open the Metro URL
3. load the JS bundle from the local machine

## ADB helpers

Useful when the phone cannot reach Metro directly:

```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
adb reverse tcp:19001 tcp:19001
```

## Build methods

### Preferred debug APK build

Use GitHub Actions workflow:

- workflow name: `Expo Android Debug`

This is the preferred build path because the server is fragile during full Expo Android native builds.

### Server build

Repo root script:

```bash
cd /home/admin/apps/bizo-back
OUTPUT_DIR=/home/admin/bizo-storage/mobile-builds bash ./scripts/build-mobile-expo-apk.sh
```

Notes:

- the script now reuses the cached Docker image if it already exists
- force image rebuild only when needed:

```bash
FORCE_REBUILD_IMAGE=1 bash ./scripts/build-mobile-expo-apk.sh
```

## Known constraints

- Server Expo Android builds are heavy on CPU, RAM, disk I/O, and Docker cache
- GitHub Actions is safer than repeated full native builds on the server
- If Metro or Babel breaks locally, first verify:
  - Node version is `v20.19.6`
  - `npx expo install --check` returns clean

## Current validated fixes

- `@shopify/flash-list` pinned to `2.0.2` for Expo SDK 56 compatibility
- Babel config fixed for NativeWind
- Expo dev client bundling is working again after these corrections
