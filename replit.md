# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the **Dawaar** app — a Middle East themed Monopoly clone built with React Native / Expo.

## App: Dawaar (دوّار)

**Dawaar** is an Arabic word meaning "roundabout/circling" — fitting for a Monopoly-style board game where players travel around the board through iconic Middle Eastern cities.

### Features
- Create & join multiplayer games via 6-character game code
- Real-time synchronization via long-polling
- 40-space board themed around iconic Arab world cities (Mecca, Medina, Dubai, Cairo, Gaza City, Jerusalem, Riyadh, Doha, Casablanca…)
- Airlines: Emirates, Etihad Airways, Qatar Airways, Saudia (replaces generic railroads)
- Arabic-themed tokens: Camel, Falcon, Tiger, Panther, Gazelle, Lantern
- Full Monopoly rules: buy properties, build houses/hotels, collect rent, chance/community cards
- Jail, airlines, utilities
- Currency: Dirhams (DHS), starting money: 15,000 DHS
- Trade system between players (TradeModal with 3-step flow)
- Mortgage/unmortgage properties
- Auction declined properties (single-player)
- RevenueCat subscription integration (real in-app purchases — see below)
- Privacy Policy page: app/privacy.tsx
- Dark navy and gold aesthetic with Arabic typography

## Board Color Groups (most → least expensive)
- **Dark Blue** (most expensive): Mecca (4000 DHS), Medina (4000 DHS)
- **Green**: Jerusalem, Dubai, Abu Dhabi
- **Yellow**: Doha, Riyadh, Jeddah
- **Red**: Casablanca, Gaza City, Cairo
- **Orange**: Baghdad, Beirut, Amman
- **Pink**: Kuwait City, Muscat, Damascus
- **Light Blue**: Khartoum, Tripoli, Algiers
- **Brown** (cheapest): Tunis, Sana'a

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Mobile**: React Native + Expo Router (file-based routing)
- **API framework**: Express 5
- **Database**: PostgreSQL DDL provided in `db/schema.sql` (game state currently in-memory via Map)
- **Validation**: Zod (`zod/v4`)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server with game logic
│   │   └── src/game/       # Game engine: board, state machine, store
│   └── dawaar/             # Expo React Native app
│       ├── app/            # Expo Router pages: index, lobby, game, privacy
│       ├── components/     # SubscribeModal, TradeModal, etc.
│       ├── context/        # GameContext with full game state + API calls
│       ├── lib/            # revenuecat.tsx — real RC integration
│       └── constants/      # Theme colors
├── scripts/
│   └── src/
│       └── seedRevenueCat.ts  # Run after RC integration is connected
├── db/
│   └── schema.sql          # PostgreSQL DDL for full relational schema
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

## RevenueCat Integration — PENDING USER ACTION

RevenueCat real subscriptions are coded and ready but require the user to:

1. Connect the **RevenueCat integration** (was dismissed during setup)
2. Once connected, run: `pnpm --filter @workspace/scripts run seed:revenuecat`
3. Copy the printed env vars into Replit secrets:
   - `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY`
   - `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`
   - `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`
   - `REVENUECAT_PROJECT_ID`
   - `REVENUECAT_TEST_STORE_APP_ID`
   - `REVENUECAT_APPLE_APP_STORE_APP_ID`
   - `REVENUECAT_GOOGLE_PLAY_STORE_APP_ID`

The seed script creates the Dawaar project, iOS/Android apps, a `premium` entitlement, the `default` offering, and a `$rc_monthly` package priced at $4.99/month in the test store.

**NOTE**: Do NOT use Replit integrations for RevenueCat — user dismissed it. If the user provides RevenueCat API credentials directly, store them via environment-secrets skill and add a `revenueCatClient.ts` file to `scripts/src/`.

## API Endpoints

- `POST /api/games` — Create new game
- `GET /api/games/:id` — Get game state
- `POST /api/games/:id/join` — Join game
- `POST /api/games/:id/start` — Start game (host only)
- `POST /api/games/:id/roll` — Roll dice
- `POST /api/games/:id/buy` — Buy current property
- `POST /api/games/:id/end-turn` — End turn
- `POST /api/games/:id/build` — Build house/hotel
- `POST /api/games/:id/mortgage` — Mortgage/unmortgage property
- `POST /api/games/:id/trade` — Propose/accept trade
- `POST /api/games/:id/auction` — Submit auction bid
- `POST /api/games/:id/claim-ad-reward` — Claim ad bonus (1500 DHS)
- `GET /api/games/:id/poll?version=N` — Long-poll for state updates

## Google Play Store Checklist (remaining)

- [ ] Connect RevenueCat integration + run seed script + set env vars
- [ ] Set `EXPO_PUBLIC_REVENUECAT_*` env vars after seeding
- [ ] Configure EAS build (`eas.json`) for production APK
- [ ] Set `android.package` in `app.json` → `com.dawaar.game`
- [ ] Upload privacy policy URL (app/privacy.tsx) to a public hosting URL
- [ ] Complete Google Play content rating questionnaire
- [ ] Complete data safety form (see advisory below)

## Data Safety Form Advisory (Google Play)

- **Does the app collect/share user data?** → Approximate location: NO; Personal info: Name (user-entered, not shared) → YES
- **Is data encrypted in transit?** → YES (HTTPS to API server)
- **Can users request deletion?** → YES (uninstall removes all local data)
- **In-app purchases?** → YES (RevenueCat / Google Play Billing)

## Content Rating (IARC / Google Play)

Dawaar is appropriate for ages 4+. No violence, no sexual content, no user-generated content, no location sharing. PEGI 3 / E for Everyone.
