#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Build type: "dev" (default, includes expo-dev-client) or "release"
BUILD_TYPE="${1:-dev}"

echo "=== Building $BUILD_TYPE APK ==="

# Ensure container exists (builds image on first run)
docker compose up -d --build 2>&1 | tail -3

case "$BUILD_TYPE" in
  dev|debug)
    # Development build with expo-dev-client — connects to expo start --dev-client
    VARIANT="assembleDebug"
    APK_FILE="app/build/outputs/apk/debug/app-debug.apk"
    ;;
  release)
    VARIANT="assembleRelease"
    APK_FILE="app/build/outputs/apk/release/app-release.apk"
    ;;
  *)
    echo "Usage: $0 [dev|release]"
    echo "  dev     — development APK with dev-client (default)"
    echo "  release — production APK"
    exit 1
    ;;
esac

# Run the build inside the container
docker compose exec -T builder bash -c "
  set -e
  if [ ! -d android ]; then
    echo '=== Generating native project ==='
    npx expo prebuild --platform android
    # Add .debug suffix so dev APK installs alongside release
    if ! grep -q 'applicationIdSuffix ".debug"' android/app/build.gradle 2>/dev/null; then
      sed -i 's/debug {$/debug {\n            applicationIdSuffix ".debug"/' android/app/build.gradle
    fi
  fi
  echo '=== Building APK ==='
  cd android && ./gradlew $VARIANT
  if [ -f '$APK_FILE' ]; then
    echo ''
    echo '=== Done: \$PWD/$APK_FILE ==='
    ls -lh '$APK_FILE'
  fi
"

# The container path translates to:
if [ "$BUILD_TYPE" = "dev" ] || [ "$BUILD_TYPE" = "debug" ]; then
  echo ""
  echo "APK on host: android/app/build/outputs/apk/debug/app-debug.apk"
  echo ""
  echo "=== Next steps ==="
  echo "  1. Install app-debug.apk on your phone"
  echo "  2. npx expo start --dev-client"
  echo "  3. Open the app and connect to the dev server URL"
else
  echo ""
  echo "APK on host: android/app/build/outputs/apk/release/app-release.apk"
fi
