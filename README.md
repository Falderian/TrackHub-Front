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

## Development (Docker)

No local SDK needed — everything runs in a container.

```bash
docker-compose up --build
```

Edit files on your host, Metro picks up changes. The `node_modules` volume is kept inside the container.

## Device testing

1. Run the container
2. Install [Expo Go](https://expo.dev/go) on your phone
3. Connect to `exp://<your-lan-ip>:8081`
4. The app loads over the network — no build, no cable

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
