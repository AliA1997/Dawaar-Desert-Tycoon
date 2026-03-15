# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the **Dawaar** app — a Middle East themed Monopoly clone built with React Native / Expo.

## App: Dawaar (دوّار)

**Dawaar** is an Arabic word meaning "roundabout/circling" — fitting for a Monopoly-style board game where players travel around the board through iconic Middle Eastern cities.

### Features
- Create & join multiplayer games via 6-character game code
- Real-time synchronization via long-polling
- 40-space board themed around: Mecca, Dubai, Cairo, Istanbul, Casablanca, and more
- Arabic-themed tokens: Camel, Falcon, Dhow, Palm Tree, Crescent, Oil Lamp
- Full Monopoly rules: buy properties, build houses/hotels, collect rent, chance/community cards
- Jail, railroads (Haramain Railway, Etihad Rail, Al-Boraq Railway, Qatar Airways Express), utilities
- Currency: Dirhams (DHS), starting money: 15,000 DHS
- Trade system between players
- Mortgage/unmortgage properties
- Deep navy and gold aesthetic with Arabic typography

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Mobile**: React Native + Expo Router (file-based routing)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (unused, game state in-memory)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server with game logic
│   │   └── src/game/       # Game engine: board, state machine, store
│   └── dawaar/             # Expo React Native app
│       ├── app/            # Expo Router pages: index, lobby, game
│       ├── context/        # GameContext with full game state + API calls
│       └── constants/      # Theme colors
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

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
- `GET /api/games/:id/poll?version=N` — Long-poll for state updates

## Game Board Properties (40 spaces)

Brown → Light Blue → Pink → Orange → Red → Yellow → Green → Dark Blue

Notable properties: Medina, Muscat, Kuwait City, Manama, Doha, Riyadh, Mecca, Istanbul, Cairo, Alexandria, Dubai, Abu Dhabi, NEOM, Burj Khalifa, Palm Jumeirah

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json`. Root `tsconfig.json` lists all packages as project references.

- `pnpm run typecheck:libs` — build composite libs
- `pnpm run typecheck` — full typecheck
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client
