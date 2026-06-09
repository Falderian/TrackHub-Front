#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# ============================================================
#  TrackHub — Release APK Builder
# ============================================================
#  Builds a signed, production-ready APK. Requires the
#  release signing setup to have been run first:
#    ./setup-release-signing.sh
#
#  Usage:
#    ./build-release-apk.sh
# ============================================================

KEYSTORE_FILE="android/app/release.keystore"
PASSWORD_FILE=".release-keystore.password"
APK_OUTPUT_DIR="dist"

echo ""
echo "=== TrackHub — Release APK Builder ==="
echo ""

# --- Verify signing is configured ---
if [ ! -f "$KEYSTORE_FILE" ]; then
  echo "ERROR: Release keystore not found at: $KEYSTORE_FILE"
  echo "       Run ./setup-release-signing.sh first."
  exit 1
fi

if [ ! -f "$PASSWORD_FILE" ]; then
  echo "ERROR: Password file not found at: $PASSWORD_FILE"
  echo "       Run ./setup-release-signing.sh first."
  exit 1
fi

if ! grep -q "RELEASE_STORE_FILE" android/gradle.properties 2>/dev/null; then
  echo "ERROR: Signing properties not found in gradle.properties"
  echo "       Run ./setup-release-signing.sh first."
  exit 1
fi

echo "Signing configuration verified."

# --- Build ---
echo ""
./build-apk.sh release

# --- Collect ---
APK_SRC="android/app/build/outputs/apk/release/app-release.apk"

if [ -f "$APK_SRC" ]; then
  mkdir -p "$APK_OUTPUT_DIR"
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  APK_DST="${APK_OUTPUT_DIR}/TrackHub-${TIMESTAMP}-release.apk"
  cp "$APK_SRC" "$APK_DST"

  echo ""
  echo "=== Build successful ==="
  echo "  APK:  $APK_DST"
  echo "  Size: $(du -h "$APK_DST" | cut -f1)"
else
  echo ""
  echo "ERROR: Build failed — APK not found at: $APK_SRC"
  exit 1
fi
