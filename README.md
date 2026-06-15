# TrackHub — Mobile

Cycling GPS tracker mobile app. React Native + Expo + Paper UI.

## Stack

| Layer | Choice |
|---|---|
| Runtime | Expo SDK 54 |
| Routing | Expo Router (file-based) |
| UI | React Native Paper (Material Design 3) |
| Theme | Nord palette + red accent |
| Auth | JWT (access + refresh) |
| Backend | [TrackHub API](https://trackhub.falderian.deno.net) |

## Development

```bash
npm install
npx expo start --dev-client
```

## Device testing (dev build)

This project uses native modules (`react-native-maps`, background location) that
are **not available in Expo Go**. Building is containerized — no Android SDK on the host:

```bash
# Build the dev APK (Docker handles Android SDK)
./build-dev-apk.sh

# Start the dev server (host — JS bundler only)
npx expo start --dev-client
```

Install the APK on your phone, then open the app and connect to the dev server URL.
Your phone and machine must be on the same network.

## Backend

The API is deployed at `https://trackhub.falderian.deno.net`. Local dev: `cd ../back && deno task dev`.

## Structure

```
app/
├── _layout.tsx              # Root: PaperProvider + AuthProvider
├── index.tsx                # Redirect to login
├── (auth)/
│   ├── _layout.tsx          # Auth stack
│   ├── login.tsx            # Login screen
│   └── register.tsx         # Registration screen
└── (tabs)/
    ├── _layout.tsx          # Tab navigator
    └── index.tsx            # Home (user info, rides)
services/
└── api.ts                   # HTTP client, auth header injection
contexts/
└── auth.tsx                 # Auth state, login/register/logout
constants/
└── theme.ts                 # Paper MD3 Nord theme (dark + light)
```

## Auth

JWT tokens (7d access, 30d refresh). Login/register → store tokens → auto-attach `Authorization` header.

Test credentials are pre-filled on the login screen for development convenience.
