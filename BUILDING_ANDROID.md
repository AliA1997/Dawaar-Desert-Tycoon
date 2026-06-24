# Building Dawaar for the Google Play Store

The Expo client uses native modules (`react-native-purchases`, `react-native-reanimated`,
gesture-handler, etc.) that **are not bundled in Expo Go**. That is why the project never
fully runs in Expo Go — it needs a real native build. We build with **EAS Build**
(Expo Application Services), which compiles in the cloud and produces:

- a **`.apk`** (preview profile) for installing directly on a test device, and
- a **`.aab`** Android App Bundle (production profile) for uploading to Google Play.

All commands below run from the app directory: `artifacts/dawaar`.

---

## 0. Prerequisites (one time)

| Need | How |
| ---- | --- |
| Node 20+ and pnpm 9+ | already required by the monorepo |
| Expo account (free) | sign up at https://expo.dev |
| EAS CLI | `npm install -g eas-cli` (or prefix commands with `npx`) |
| Google Play Console account | one-time **$25** at https://play.google.com/console |

```bash
cd artifacts/dawaar
eas login            # sign in to your Expo account
```

---

## 1. Initialize the EAS project (one time)

```bash
eas init
```

This creates the project on Expo's servers and writes `extra.eas.projectId` into
`app.json`. Commit that change.

The Android signing keystore is generated and stored by EAS the first time you build —
you do not manage it manually. To inspect or download it later: `eas credentials`.

> Already configured in the repo: `eas.json` (build profiles), `app.json`
> (`android.package = com.qamarlabs.dawaar`, version code, adaptive icon), and a
> monorepo-aware `metro.config.js`.

---

## 2. Point the build at your deployed API ⚠️

A store build has no `.env.local` and no Replit domain, so you **must** bake in the API
URL at build time. Edit the `env.EXPO_PUBLIC_API_BASE_URL` value in `eas.json` for the
`preview` and `production` profiles, replacing the placeholder:

```jsonc
"env": { "EXPO_PUBLIC_API_BASE_URL": "https://api.your-domain.com/api" }
```

The `api-server` (`artifacts/api-server`) must be deployed and reachable at that URL.
If you skip this, the app builds but cannot reach the backend.

---

## 3. Test build — installable APK

```bash
pnpm android:preview      # eas build --platform android --profile preview
```

When it finishes, EAS prints a URL to download the `.apk`. Install it on any Android
device (enable "install unknown apps") and verify the game runs against your API.

For an iterative dev workflow with a custom dev client instead:

```bash
pnpm android:dev          # development profile (developmentClient: true)
```

---

## 4. Release build — Play Store App Bundle

Bump the user-facing version in `app.json` (`expo.version`, e.g. `1.0.0` → `1.0.1`)
when shipping a new release. `android.versionCode` auto-increments on each production
build (`autoIncrement: true` in `eas.json`).

```bash
pnpm android:release      # eas build --platform android --profile production
```

This produces a signed `.aab`. Download it from the build page.

---

## 5. Get it onto Google Play

### Option A — manual (simplest for the first release)
1. In the [Play Console](https://play.google.com/console), create the app
   (package name **must** match `com.qamarlabs.dawaar`).
2. Complete the store listing, content rating, data-safety form, and pricing.
3. Create a release on the **Internal testing** track and upload the `.aab`.
4. Promote Internal → Closed → Open → Production when you're ready.

### Option B — automated submit from the CLI
1. In Google Cloud, create a **service account** with Play access, download its JSON
   key, and save it as `artifacts/dawaar/play-store-service-account.json`
   (already git-ignored — never commit it).
2. Grant that service account access in Play Console → Users & permissions.
3. Submit the most recent production build:

```bash
pnpm android:submit       # eas submit ... --profile production --latest
```

It uploads to the `internal` track (see `submit.production.android.track` in `eas.json`).

---

## Versioning cheat-sheet

| File / field | When to change |
| ------------ | -------------- |
| `app.json` → `expo.version` | every user-facing release (e.g. `1.0.1`) |
| `app.json` → `android.versionCode` | auto-incremented by EAS on production builds |
| `eas.json` → `env.EXPO_PUBLIC_API_BASE_URL` | whenever the deployed API URL changes |

## Notes / gotchas

- **iOS** is pre-configured too (`ios.bundleIdentifier = com.qamarlabs.dawaar`); build it
  with `eas build --platform ios` once you have an Apple Developer account.
- **RevenueCat / in-app purchases** are currently stubbed (`lib/revenuecat.tsx`). The
  native module still links into the build but is inert. Wire real API keys and restore
  the implementation before enabling subscriptions in production.
- **Secrets** (`play-store-service-account.json`, keystores, `.env*.local`) are
  git-ignored. For CI builds, store `EXPO_PUBLIC_API_BASE_URL` and any secrets in
  EAS with `eas secret:create` instead of hardcoding.
