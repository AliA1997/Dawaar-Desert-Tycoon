# Running Dawaar locally

This guide is for running the project on your own laptop (outside Replit). On
Replit, the workflows panel already starts everything for you — there is
nothing to do.

The project is a pnpm monorepo with two services you care about:

| Artifact         | Path                     | What it is                  |
| ---------------- | ------------------------ | --------------------------- |
| `@workspace/api-server` | `artifacts/api-server` | Express API (game rules, state, long-poll) |
| `@workspace/dawaar`     | `artifacts/dawaar`     | Expo (React Native) client  |

## 1. One-time setup

```bash
# from the repo root
pnpm install
```

You need Node 20+ and pnpm 9+.

## 2. Start the API server (terminal 1)

```bash
pnpm dev:api
```

By default this binds to `PORT=3001`. Override it with `PORT=4000 pnpm dev:api`.

You should see `API server listening on http://0.0.0.0:3001` and a `GET /api/health`
endpoint should return `{ "ok": true }`:

```bash
curl http://localhost:3001/api/health
```

Game state is held in memory and snapshotted to `artifacts/api-server/data/games.json`
so an accidental restart doesn't wipe an in-progress game.

## 3. Point the client at the local API (terminal 2)

Create `artifacts/dawaar/.env.local`:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

When `EXPO_PUBLIC_API_BASE_URL` is set, the client uses it directly. When it
isn't set, the client falls back to `https://${EXPO_PUBLIC_DOMAIN}/api`, which
is the value Replit injects in the hosted workspace.

If you're testing on a physical phone over Expo Go, replace `localhost` with
your machine's LAN IP (e.g. `http://192.168.1.42:3001/api`) so the phone can
reach your laptop.

## 4. Start the client

```bash
pnpm dev:client
```

This runs Expo. Press `w` to open the web build, scan the QR code with Expo Go,
or press `i` / `a` for an iOS / Android simulator.

## 5. Useful checks

```bash
pnpm typecheck        # whole monorepo
pnpm test:api         # vitest suite for the API server (51 tests)
pnpm -r build         # build everything
```

## Project layout (server)

The API server is organised by game **domain** instead of by file size:

```
artifacts/api-server/src/
  domains/
    board/         — board data, builder, 28-space challenge boards
    dice/          — dice roll + per-turn movement & landing effects
    properties/    — buy / build / sell / mortgage / auction settlement
    economy/       — tax choice + ad-watch reward
    events/        — Chance / Community Chest card effects
    trading/       — propose / accept / decline trades
    turns/         — lobby (create/join/ready/start), end turn, jail
    players/       — player types + persisted reward-point profile
    services/      — in-memory game store with JSON snapshot
    ai/            — placeholder (NPC logic still lives on the client today)
    monetization/  — placeholder (reward points + RevenueCat hooks)
  routes/          — one Express router per domain, all mounted under /games
  game/            — thin re-export shims kept for backwards compatibility
```

If you add a new game feature, put the rule in the matching domain and add a
matching handler in `routes/`. Avoid the `game/` shim files in new code —
import directly from `../domains/<name>/...`.
