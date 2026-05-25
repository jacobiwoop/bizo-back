#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="${APP_DIR:-$ROOT_DIR/bizo-app}"
OUTPUT_DIR="${OUTPUT_DIR:-/home/admin/bizo-storage/mobile-builds}"
IMAGE_NAME="${IMAGE_NAME:-bizo-android-builder:latest}"
APK_SOURCE_REL="app/build/outputs/apk/debug/app-debug.apk"
APP_REPO_URL="${APP_REPO_URL:-https://github.com/jacobiwoop/bizo-test.git}"
APP_REF="${APP_REF:-main}"
APP_CLONE_DIR="${APP_CLONE_DIR:-/tmp/bizo-app-build-src-$$-$(date +%s)}"
BUILD_CONTAINER="bizo-android-build-$$-$(date +%s)"
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
  echo "==> Repo mobile introuvable localement, clonage..."
  git clone --depth 1 --branch "$APP_REF" "$APP_REPO_URL" "$APP_CLONE_DIR"
  APP_DIR="$APP_CLONE_DIR"
fi

echo "==> Build image Android..."
$DOCKER_BIN build -f "$APP_DIR/Dockerfile.android" -t "$IMAGE_NAME" "$APP_DIR"

echo "==> Build APK debug..."
$DOCKER_BIN create \
  --name "$BUILD_CONTAINER" \
  -u "$(id -u):$(id -g)" \
  -w /workspace \
  "$IMAGE_NAME" \
  bash -lc "gradle --no-daemon -Dorg.gradle.jvmargs='-Xmx2g -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8' assembleDebug" >/dev/null

$DOCKER_BIN cp "$APP_DIR/." "$BUILD_CONTAINER:/workspace"
$DOCKER_BIN start -a "$BUILD_CONTAINER"
$DOCKER_BIN cp "$BUILD_CONTAINER:/workspace/$APK_SOURCE_REL" "$TMP_APK_DIR/app-debug.apk"

APK_SOURCE="$TMP_APK_DIR/app-debug.apk"

mkdir -p "$OUTPUT_DIR/releases" "$OUTPUT_DIR/latest"

STAMP="$(date -u +%Y%m%d_%H%M%S)"
GIT_SHA="$(git -C "$APP_DIR" rev-parse --short HEAD 2>/dev/null || echo unknown)"
VERSION_NAME="$(grep -E 'versionName = ' "$APP_DIR/app/build.gradle.kts" | head -n1 | sed -E 's/.*"([^"]+)".*/\1/')"
VERSION_CODE="$(grep -E 'versionCode = ' "$APP_DIR/app/build.gradle.kts" | head -n1 | sed -E 's/.*= ([0-9]+).*/\1/')"
ARCHIVE_NAME="bizo-app-${STAMP}-${GIT_SHA}-debug.apk"

cp "$APK_SOURCE" "$OUTPUT_DIR/releases/$ARCHIVE_NAME"
cp "$APK_SOURCE" "$OUTPUT_DIR/latest/app-debug.apk"

cat > "$OUTPUT_DIR/latest/latest.json" <<JSON
{
  "download_name": "bizo-app-debug.apk",
  "archive_name": "$ARCHIVE_NAME",
  "git_sha": "$GIT_SHA",
  "version_name": "${VERSION_NAME:-unknown}",
  "version_code": ${VERSION_CODE:-0},
  "built_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
JSON

echo "==> APK publie dans:"
echo "    $OUTPUT_DIR/latest/app-debug.apk"
echo "    $OUTPUT_DIR/releases/$ARCHIVE_NAME"
