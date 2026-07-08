# TrackHub — Mobile

Cycling GPS tracker mobile app. React Native + Expo + Paper UI.

## Stack

| Layer | Choice |
|---|---|
| Runtime | Expo SDK 54 |
| Routing | Expo Router (file-based, stack navigation) |
| UI | React Native Paper (Material Design 3) |
| Maps | @maplibre/maplibre-react-native (Stadia Maps tiles) |
| Charts | react-native-gifted-charts |
| Theme | Nord palette + red accent |
| Auth | JWT (access + refresh, expo-secure-store) |
| Backend | [TrackHub API](https://trackhub-to06.onrender.com) |

## Development

```bash
npm install
npx expo start --dev-client
```

## Device testing (dev build)

This project uses native modules (`@maplibre/maplibre-react-native`, background location) that
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

The API is deployed at `https://trackhub-to06.onrender.com`. Local dev: `cd ../back && deno task dev`.

## Offline & guest mode

TrackHub works without internet for ride recording:

- **Guest mode** — tap "Continue Offline" on the login screen to enter without an account. Record rides immediately; they sync when you log in.
- **Crash recovery** — if the app closes mid-ride, you'll be prompted to resume or discard on next launch.
- **Background tracking** — rides continue recording even when the app is in the background (requires location permission "Always").

All ride data is persisted locally via AsyncStorage and synced to the backend when connectivity returns.

## Structure

```
app/
├── _layout.tsx              # Root: SafeArea + PaperProvider + QueryClient + AuthProvider + Stack
├── index.tsx                # Entry redirect: user → /home, no user → /(auth)/login
├── (auth)/
│   ├── _layout.tsx          # Auth stack (headerless)
│   ├── login.tsx            # Login screen + "Continue Offline" button
│   └── register.tsx         # Registration screen
├── home.tsx                 # Home: header, stats, recent rides, Start a Ride CTA
├── dashboard.tsx            # Full ride list with search, swipe-to-delete
├── record.tsx               # Live recording: map + stats panel + controls
├── stats.tsx                # Charts: weekly/monthly/annual distance/rides/time
├── profile.tsx              # User avatar, stats, logout
└── ride/
    └── [id].tsx             # Ride detail: map, stats, charts, GPX export, delete
components/
├── DeleteRideDialog.tsx     # Delete confirmation dialog
├── ElevationProfile.tsx     # Elevation area chart
├── EmptyRides.tsx           # "No rides yet" placeholder
├── ErrorBanner.tsx          # Inline error with retry button
├── HomeHeader.tsx           # Avatar, welcome, stats row, CTA
├── RideCard.tsx             # Compact ride card (home screen)
├── RideControls.tsx         # Start / Pause / Resume / Stop buttons
├── RideDetailHeader.tsx     # Back arrow + delete button
├── RideExpandedStats.tsx    # Expanded live stats panel
├── RideMap.tsx              # MapLibre map with route line + user location
├── RidePanel.tsx            # Recording overlay panel
├── RideRow.tsx              # Swipeable ride row (dashboard)
├── RideStats.tsx            # Compact live stats (distance, elapsed, speed)
├── RideTopBar.tsx           # Status pill + back + crosshair + expand
├── SpeedChart.tsx           # Speed line chart with color-coded zones
├── StatCard.tsx             # Icon + value + label card
├── StatsChart.tsx           # Bar chart with metric toggle
├── StatsSummary.tsx         # Stats page header (3 StatCards)
├── StatusPill.tsx           # Recording status badge
└── SwipeableRow.tsx         # Swipe-to-delete row wrapper
services/
├── api.ts                   # HTTP client, auth header injection, all endpoints
├── config.ts                # API base URL (dev: localhost, prod: Deno deploy)
├── location.ts              # GPS tracking engine, outlier filtering, elevation
├── recovery.ts              # Deferred sync replay on reconnect
├── storage.ts               # AsyncStorage persistence for active ride + sync meta
└── tokens.ts                # SecureStore token management + refresh
hooks/
├── queries.ts               # React Query hooks for all API data
├── useRecovery.ts           # App-launch orphaned ride recovery
├── useRide.ts               # Main ride state hook (elapsed, distance, speed)
├── useRideDetail.ts         # Ride detail data + computed labels
└── useRideSync.ts           # Incremental sync to backend (15s flush)
contexts/
├── auth.tsx                 # Auth state: login, register, logout, guest mode
└── RecordUIContext.tsx       # Recording UI state: auto-center, expanded, mapRef
constants/
├── maps.ts                  # Stadia Maps tile URLs
└── theme.ts                 # Nord MD3 dark + light themes
helpers/
├── ride.ts                  # Haversine, formatting, speed zones, chart labels
└── stats.ts                 # Date ranges, granularity, label formatting
```

## Auth

JWT tokens (7d access, 30d refresh). Login/register → store tokens → auto-attach `Authorization` header.

Test credentials are pre-filled on the login screen for development convenience.
