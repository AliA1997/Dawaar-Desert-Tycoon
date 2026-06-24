# CLAUDE Constitution

Dawaar (Desert Tycoon) is a full-stack, Monopoly-style multiplayer board game for mobile. It is a **pnpm monorepo**: a React Native (Expo) client and an Express API server, with shared TypeScript packages for the API contract and database schema.

- Full-stack React Native application; everything ships from the `artifacts/` folder.
- Backend: Express API in `artifacts/api-server`.
- Frontend: Expo (React Native) client in `artifacts/dawaar`.
- Shared contract & infra packages live in `lib/`.

## Tech Stack

**Frontend (`artifacts/dawaar`)**
- React Native 0.81 + Expo ~54 (with `expo-router` ~6 for file-based routing)
- React 19.1 (exact — pinned by Expo) + React Compiler (babel plugin)
- `react-native-reanimated` ~4 + `react-native-worklets` for animation
- `@tanstack/react-query` (catalog) for server state; `@nkzw/create-context-hook`
- `react-native-purchases` (RevenueCat) for subscriptions/IAP
- `@react-native-async-storage/async-storage` for local persistence

**Backend (`artifacts/api-server`)**
- Express ^5 on Node 20+, ESM (`"type": "module"`)
- `tsx` for dev/run, `esbuild` for build, `vitest` + `supertest` for tests
- `drizzle-orm` (Postgres) via `@workspace/db` (DB integration is a follow-up; live
  game state is currently in-memory with JSON snapshotting)

**Shared (`lib/`)**
- TypeScript ~5.9 everywhere
- Zod ^3 (catalog) for schema/validation
- `lib/api-spec` — OpenAPI spec + Orval codegen
- `lib/api-client-react` — generated React Query client (`@workspace/api-client-react`)
- `lib/api-zod` — generated Zod schemas (`@workspace/api-zod`)
- `lib/db` — Drizzle schema + pool (`@workspace/db`)

**Tooling**: pnpm workspaces + catalog, `cross-env`, Prettier, TypeScript project references.

## Architectural Principles

### Monorepo layout
```
artifacts/
  api-server/   @workspace/api-server  — Express API (game rules, state, long-poll)
  dawaar/       @workspace/dawaar      — Expo / React Native client
  mockup-sandbox/                      — design/prototype sandbox
lib/
  api-spec/         OpenAPI source + Orval config
  api-client-react/ @workspace/api-client-react — generated React Query hooks
  api-zod/          @workspace/api-zod          — generated Zod schemas
  db/               @workspace/db               — Drizzle schema + pg pool
scripts/            @workspace/scripts          — workspace tooling
```

### Backend: domain-driven, pure-function game logic
The server is organized by game **domain**, not by file size. Each domain owns one
slice of the rules:

```
artifacts/api-server/src/
  domains/
    board/       board data, builder, 28-space challenge boards
    dice/        dice roll + per-turn movement & landing effects
    properties/  buy / build / sell / mortgage / auction settlement
    economy/     tax choice + ad-watch reward
    events/      Chance / Community Chest card effects
    trading/     propose / accept / decline trades
    turns/       lobby (create/join/ready/start), end turn, jail (lifecycle.ts)
    players/     player types + persisted reward-point profile
    services/    in-memory game store + JSON snapshot + change events
    ai/          placeholder (NPC logic still lives on the client today)
    monetization/ placeholder (reward points + RevenueCat hooks)
  routes/        one Express router per domain, all mounted under /games
  game/          thin re-export shims kept for backwards compatibility
```

- **Game logic is pure functions over `GameState`.** Rule functions take a state plus inputs and return `{ state: GameState; error?: string }` — they never mutate the argument; they spread a new state and bump `version`. Persistence and HTTP live outside these functions.
- **The single source of truth is `GameState`** (`domains/turns/state.ts`), held in an in-memory `Map` in `services/gameStore.ts`. `setGame` schedules a debounced JSON snapshot to `data/games.json` (crash recovery) and emits a `change` event.
- **Migrating game state to Supabase/Postgres (`@workspace/db`) is a tracked
  follow-up.** Don't assume a database is wired in for live games yet.

### Frontend: file-based routing + a single game context
- Screens live in `artifacts/dawaar/app/` (`expo-router`): `index`, `lobby`, `game`,
  `challenges`, plus `app/modals/`. `_layout.tsx` is the root.
- **`context/GameContext.tsx` is the heart of the client** — it holds `GameState`,
  player identity, and every game action (`rollDice`, `buyProperty`, `proposeTrade`,
  …). Components consume it via the context hook rather than calling the API directly.
- The client talks to the server over the `EXPO_PUBLIC_API_BASE_URL` base; if unset it
  falls back to the Replit dev domain (`https://${EXPO_PUBLIC_DOMAIN}/api`).

### Client ↔ server sync: event-driven long-poll
- The client tracks `GameState.version`; the server's `GET /api/games/:gameId/poll`
  holds the request open (up to ~20s) until `version` advances or times out, using the
  `gameEvents` EventEmitter. Every state change bumps `version` so polling is cheap and
  near-real-time. Preserve this contract when adding state-changing endpoints.

### Shared API contract is generated, not hand-written
- The OpenAPI spec in `lib/api-spec/openapi.yaml` is the source of truth. Orval
  generates the React Query client (`api-client-react`) and Zod schemas (`api-zod`).
  **Edit the spec and regenerate** — do not hand-edit files under `*/generated/`.

## Code Patterns

- **Express handlers stay thin.** Validate presence of `req.body` fields, load state via `getGame`, delegate to the domain function, branch on its `error`, then `setGame` + return the new state. Mirror the existing handlers in `routes/turns.ts`.
- **Error convention:** `404 { error: 'Game not found' }` for missing games,
  `400 { error: '<message>' }` for invalid input or rule violations. Domain functions surface rule failures as a returned `error` string, never thrown exceptions.
- **State is immutable.** Spread to produce new state, increment `version`, and append to `log` with `{ message, timestamp: new Date().toISOString(), playerId }`.
- **ESM import paths use `.js` extensions** in server source (e.g.
  `'../domains/turns/lifecycle.js'`) — required by Node ESM even for `.ts` sources.
- **Prefer importing from `domains/<name>/…` directly**; avoid the legacy `game/` re-export shims in new code.
- **Money is in DHS** (in-game currency); shared types like `GameState`, `Player`, `BoardProperty` are intentionally duplicated client-side in `GameContext.tsx` — keep them in sync with `domains/turns/state.ts`.
- **Currency/UI is bilingual** (English + Arabic, e.g. `name` / `nameAr`); keep both.

## Commands

Run from the repo root:

```bash
pnpm install              # one-time; pnpm only (preinstall blocks npm/yarn)
pnpm dev:api              # Express API on PORT=3001
pnpm dev:client           # Expo client on :8081, pointed at localhost:3001
pnpm typecheck            # type-check the whole monorepo
pnpm test:api             # vitest suite for the API server
pnpm -r build             # build every package
```

- Node 20+ and pnpm 9+ required.
- Local client config: create `artifacts/dawaar/.env.local` with
  `EXPO_PUBLIC_API_BASE_URL=http://localhost:3001/api` (use your LAN IP for a physical
  device). See `RUNNING_LOCALLY.md` for the full walkthrough.

## Dependency & Security Rules

- **pnpm only.** The root `preinstall` hook deletes `package-lock.json`/`yarn.lock` and
  refuses any non-pnpm agent.
- **Use the catalog.** Shared versions (react, zod, drizzle-orm, tsx, …) are pinned in
  `pnpm-workspace.yaml`'s `catalog:`. Reference `catalog:` instead of hardcoding.
- **`react` / `react-dom` are pinned to exact `19.1.0`** because Expo requires it — do
  not bump them independently.
- **`minimumReleaseAge: 1440` (1 day) is a supply-chain defense — never disable it.**
  If an urgent fix is truly needed, add the package to `minimumReleaseAgeExclude` only
  for a trusted publisher, and remove the exclusion once the window passes.

## SDD Workflow

Every feature or change moves through five phases, in order. Do not skip ahead —
each phase answers a distinct question and gates the next.

### 1. Specification — *what is the user-facing behavior?*
Describe the observable behavior in plain language, before any code or design. Answer:
what does the player see and do, what are the rules and edge cases, what counts as
correct? Capture the success path and the failure paths (e.g. "can't build on a
mortgaged property", "can't roll when it isn't your turn"). No implementation detail
here — only behavior the spec can later be validated against.

### 2. Technical Planning — *how do we build it?*
Decide the approach against this architecture. Answer: which **domain**
(`domains/<name>/`) owns the rule; what shape the pure `GameState` function takes;
whether the change crosses the client/server boundary and therefore needs an
`lib/api-spec/openapi.yaml` update + Orval regeneration; which screens / `GameContext`
actions are touched; and how the long-poll `version` contract is affected. Note any
duplicated types (`state.ts` ↔ `GameContext.tsx`) that must move together.

### 3. Task Breakdown — *in what order?*
Sequence the work into discrete, reviewable steps and order them by dependency.
Typical order: update the contract (spec → regenerate) → implement the domain rule →
wire the thin `routes/<domain>.ts` handler → consume it in `GameContext` / screens →
add tests. Each task should be independently checkable.

### 4. Implementation — *the actual code.*
Build to the plan, following the Code Patterns above: pure `{ state, error }` domain
functions that spread new state and bump `version`; thin Express handlers
(`getGame` → delegate → branch on `error` → `setGame`); `.js` ESM import paths; never
hand-edit `*/generated/` code; keep bilingual (`name`/`nameAr`) fields and duplicated
types in sync.

### 5. Validation — *does it match the spec?*
Confirm the behavior from phase 1 actually holds. Add/extend `vitest` tests (see
`game/gameState.test.ts`) covering both the success path and every `error` branch, run
`pnpm test:api`, and `pnpm typecheck` the whole tree. Exercise the real flow through
the client where it crosses the boundary. If behavior and spec disagree, the spec wins
— fix the code, or revise the spec deliberately and loop back.
