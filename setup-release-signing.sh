#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

KEYSTORE="android/app/release.keystore"
PASSWORD_FILE=".release-keystore.password"
GRADLE_PROPS="android/gradle.properties"
BUILD_GRADLE="android/app/build.gradle"
ALIAS="${RELEASE_KEY_ALIAS:-trackhub-release}"

echo "=== TrackHub — Release Signing Setup ==="
echo ""

docker compose up -d --build 2>&1 | tail -1

# ---- keystore ----
if [ -f "$KEYSTORE" ]; then
  echo "• keystore: already exists"
  PASSWORD="${RELEASE_KEY_PASSWORD:-$(cat "$PASSWORD_FILE" 2>/dev/null)}"
  [ -n "$PASSWORD" ] || { echo "ERROR: set RELEASE_KEY_PASSWORD or restore $PASSWORD_FILE"; exit 1; }
else
  PASSWORD="${RELEASE_KEY_PASSWORD:-$(openssl rand -base64 32)}"
  docker compose exec -T builder mkdir -p /app/android/app
  docker compose exec -T builder keytool -genkeypair \
    -keystore "/app/$KEYSTORE" -alias "$ALIAS" \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$PASSWORD" -keypass "$PASSWORD" \
    -dname "CN=TrackHub, OU=Dev, O=TrackHub, L=Unknown, ST=Unknown, C=US"
  echo "$PASSWORD" > "$PASSWORD_FILE"
  chmod 600 "$PASSWORD_FILE"
  echo "• keystore: created ($KEYSTORE)"
  echo "  ⚠ Back up $KEYSTORE and $PASSWORD_FILE — required for Google Play updates"
fi

# ---- gradle.properties ----
# android/ files are root-owned (Docker), so modify inside the container
if docker compose exec -T builder grep -q "RELEASE_STORE_FILE" "/app/$GRADLE_PROPS" 2>/dev/null; then
  echo "• gradle.properties: already configured"
else
  docker compose exec -T builder bash -c "cat >> /app/$GRADLE_PROPS" <<EOF

RELEASE_STORE_FILE=release.keystore
RELEASE_KEY_ALIAS=$ALIAS
RELEASE_STORE_PASSWORD=$PASSWORD
RELEASE_KEY_PASSWORD=$PASSWORD
EOF
  echo "• gradle.properties: configured"
fi

# ---- build.gradle ----
if docker compose exec -T builder grep -q "signingConfigs.release" "/app/$BUILD_GRADLE" 2>/dev/null; then
  echo "• build.gradle: already configured"
else
  docker compose exec -T builder python3 << 'PYEOF'
path = "/app/android/app/build.gradle"
with open(path) as f:
    c = f.read()

# Add release entry inside signingConfigs
old = ("    signingConfigs {\n"
       "        debug {\n"
       "            storeFile file('debug.keystore')\n"
       "            storePassword 'android'\n"
       "            keyAlias 'androiddebugkey'\n"
       "            keyPassword 'android'\n"
       "        }\n"
       "    }")
new = ("    signingConfigs {\n"
       "        debug {\n"
       "            storeFile file('debug.keystore')\n"
       "            storePassword 'android'\n"
       "            keyAlias 'androiddebugkey'\n"
       "            keyPassword 'android'\n"
       "        }\n"
       "        release {\n"
       "            if (project.hasProperty('RELEASE_STORE_FILE')) {\n"
       "                storeFile file(project.property('RELEASE_STORE_FILE'))\n"
       "                storePassword project.property('RELEASE_STORE_PASSWORD')\n"
       "                keyAlias project.property('RELEASE_KEY_ALIAS')\n"
       "                keyPassword project.property('RELEASE_KEY_PASSWORD')\n"
       "            }\n"
       "        }\n"
       "    }")
c = c.replace(old, new, 1)

# Point release build type at the release signing config
c = c.replace(
    "        release {\n"
    "            // Caution! In production, you need to generate your own keystore file.\n"
    "            // see https://reactnative.dev/docs/signed-apk-android.\n"
    "            signingConfig signingConfigs.debug",
    "        release {\n"
    "            // Caution! In production, you need to generate your own keystore file.\n"
    "            // see https://reactnative.dev/docs/signed-apk-android.\n"
    "            signingConfig signingConfigs.release")

with open(path, "w") as f:
    f.write(c)
PYEOF
  echo "• build.gradle: configured"
fi

echo ""
echo "=== Done — run ./build-release-apk.sh to build ==="
