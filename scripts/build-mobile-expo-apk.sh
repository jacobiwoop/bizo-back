#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="${APP_DIR:-$ROOT_DIR/bizo-mobile-rn}"
OUTPUT_DIR="${OUTPUT_DIR:-/home/admin/bizo-storage/mobile-builds}"
IMAGE_NAME="${IMAGE_NAME:-bizo-expo-android-builder:latest}"
APK_SOURCE_REL="android/app/build/outputs/apk/debug/app-debug.apk"
BUILD_CONTAINER="bizo-expo-android-build-$$-$(date +%s)"
TMP_APK_DIR="$(mktemp -d)"

cleanup() {
  if [[ -n "${DOCKER_BIN:-}" ]]; then
    $DOCKER_BIN rm -f "$BUILD_CONTAINER" >/dev/null 2>&1 || true
  fi
  rm -rf "$TMP_APK_DIR"
}

trap cleanup EXIT

if docker info >/dev/null 2>&1; then
  DOCKER_BIN="${DOCKER_BIN:-docker}"
else
  DOCKER_BIN="${DOCKER_BIN:-sudo docker}"
fi

if [[ ! -d "$APP_DIR" ]]; then
  echo "==> Repo Expo mobile introuvable: $APP_DIR" >&2
  exit 1
fi

echo "==> Build image Android Expo..."
$DOCKER_BIN build -f "$APP_DIR/Dockerfile.android" -t "$IMAGE_NAME" "$APP_DIR"

echo "==> Build APK debug Expo..."
$DOCKER_BIN create \
  --name "$BUILD_CONTAINER" \
  -w /workspace \
  "$IMAGE_NAME" \
  bash -lc "npm ci && npx expo prebuild --platform android --non-interactive --no-install --clean && cd android && ./gradlew --no-daemon -Dorg.gradle.jvmargs='-Xmx3g -XX:MaxMetaspaceSize=768m -Dfile.encoding=UTF-8' assembleDebug" >/dev/null

$DOCKER_BIN cp "$APP_DIR/." "$BUILD_CONTAINER:/workspace"
$DOCKER_BIN start -a "$BUILD_CONTAINER"
$DOCKER_BIN cp "$BUILD_CONTAINER:/workspace/$APK_SOURCE_REL" "$TMP_APK_DIR/app-debug.apk"

APK_SOURCE="$TMP_APK_DIR/app-debug.apk"

mkdir -p "$OUTPUT_DIR/releases" "$OUTPUT_DIR/latest"

STAMP="$(date -u +%Y%m%d_%H%M%S)"
GIT_SHA="$(git -C "$APP_DIR" rev-parse --short HEAD 2>/dev/null || echo unknown)"
VERSION_NAME="$(node -p "require('$APP_DIR/package.json').version" 2>/dev/null || echo unknown)"
ARCHIVE_NAME="bizo-mobile-rn-${STAMP}-${GIT_SHA}-debug.apk"

cp "$APK_SOURCE" "$OUTPUT_DIR/releases/$ARCHIVE_NAME"
cp "$APK_SOURCE" "$OUTPUT_DIR/latest/app-debug.apk"

cat > "$OUTPUT_DIR/latest/latest.json" <<JSON
{
  "download_name": "bizo-mobile-rn-debug.apk",
  "archive_name": "$ARCHIVE_NAME",
  "git_sha": "$GIT_SHA",
  "version_name": "${VERSION_NAME:-unknown}",
  "version_code": 1,
  "built_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "stack": "expo-react-native"
}
JSON

echo "==> APK Expo publie dans:"
echo "    $OUTPUT_DIR/latest/app-debug.apk"
echo "    $OUTPUT_DIR/releases/$ARCHIVE_NAME"
