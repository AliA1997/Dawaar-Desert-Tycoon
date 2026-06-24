# Deploying the Dawaar backend

The mobile app (built via [BUILDING_ANDROID.md](BUILDING_ANDROID.md)) needs the API
server running at a public HTTPS URL. The backend (`artifacts/api-server`) is a small,
self-contained Node/Express service — this guide gets it online.

## What you're actually deploying

`pnpm --filter @workspace/api-server run build` bundles the whole server (esbuild) into a
**single file**: `artifacts/api-server/dist/index.cjs`. You run it with:

```bash
node artifacts/api-server/dist/index.cjs
```

It needs exactly one thing: a **`PORT`** environment variable (it throws on startup if
missing — every host below injects `PORT` automatically). Notably:

- **No database required.** Game state lives in memory and is snapshotted to a JSON file
  for crash recovery — nothing to provision. (Moving state to Postgres is a tracked
  follow-up.)
- **CORS is wide open** (`app.use(cors())`), so the app can call it from any device. No
  config needed.
- **Health check path:** `GET /api/healthz` → `{ "status": "ok" }`.

## ⚠️ The one constraint that decides where you host

Because state is **in-memory** and the live-update long-poll uses an in-process event
emitter, the server must run as **one single, always-on instance**.

**Do NOT use serverless / autoscale / multi-instance hosting** (Vercel, AWS Lambda,
Cloudflare Workers, or Replit's `autoscale` target). With more than one instance, players
land on different copies of the game and updates never reach them; cold starts also wipe
state. Pick a host that runs a persistent container/VM. Good fits: **Railway, Render,
Fly.io, or any VPS.**

---

## Option A — Railway (easiest for this monorepo)

1. Go to https://railway.app → **New Project → Deploy from GitHub repo** → pick this repo.
2. Open the service → **Settings** and set:
   - **Root Directory:** *(leave as the repo root — pnpm needs the whole workspace)*
   - **Build Command:** `pnpm install && pnpm --filter @workspace/api-server run build`
   - **Start Command:** `node artifacts/api-server/dist/index.cjs`
   - Railway injects `PORT` automatically — leave it alone.
3. **Settings → Networking → Generate Domain.** You get a URL like
   `https://dawaar-api-production.up.railway.app`.
4. Your API base URL is that domain **+ `/api`**, e.g.
   `https://dawaar-api-production.up.railway.app/api`.
5. Verify: open `https://<your-domain>/api/healthz` in a browser — you should see
   `{"status":"ok"}`.

> Railway's filesystem resets on each redeploy, so in-progress games are lost when you
> push a new version. That's fine for now (the JSON file is only crash-recovery); it goes
> away entirely once state moves to Postgres.

---

## Option B — Render

1. https://render.com → **New → Web Service** → connect this repo.
2. Configure:
   - **Runtime:** Node
   - **Build Command:** `pnpm install && pnpm --filter @workspace/api-server run build`
   - **Start Command:** `node artifacts/api-server/dist/index.cjs`
   - Render injects `PORT` automatically.
3. Use **at least the paid "Starter" instance** — the free tier spins down after ~15 min
   of inactivity, which causes cold-start delays and wipes active games.
4. Render gives you `https://<service>.onrender.com`; your API base is that **+ `/api`**.

---

## Option C — Any VPS / Docker (full control)

```bash
git clone <repo> && cd Dawaar-Desert-Tycoon
pnpm install
pnpm --filter @workspace/api-server run build
PORT=8080 node artifacts/api-server/dist/index.cjs
```

Run it under a process manager (`pm2`, systemd, or a Docker container restart policy) and
put it behind a reverse proxy (Caddy/Nginx) that terminates HTTPS — the app must be
reachable over `https://` for the mobile build.

---

## After the backend is live — connect the app

1. Copy your public API base URL (host **+ `/api`**).
2. Put it into [artifacts/dawaar/eas.json](artifacts/dawaar/eas.json), replacing the
   `https://YOUR-API-DOMAIN.com/api` placeholder in **both** the `preview` and
   `production` profiles' `env.EXPO_PUBLIC_API_BASE_URL`.
3. Rebuild the app: `cd artifacts/dawaar && pnpm android:preview` (then `android:release`).

The URL is baked in at build time, so any time the API URL changes you must rebuild the
app. That's the full loop: **deploy backend → set URL → rebuild app.**
