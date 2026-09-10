# Spec: Eastern Tycoon — Mobile App Fixes & Rebrand

Status: implemented alongside this spec (see Validation).
Owner: client (`artifacts/dawaar`) + api-server board/content data.

---

## 1. Specification — user-facing behavior

### 1.1 Rebrand: "Eastern Tycoon", East Asia lean

- The app is named **Eastern Tycoon**. The player sees this name on the home
  screen, the board center, the lobby, premium/subscription copy, ads copy, and
  the privacy screen. The store-facing `app.json` display name changes too.
- The game world leans **East Asia**: the 28-space main board's 16 properties
  are East Asian cities (Hanoi → Tokyo by price tier), railroads/utilities/tax
  tiles are East Asia themed, and Chance / Community Chest card texts tell East
  Asian stories instead of Middle Eastern ones.
- Bot opponents get East Asian names (Kenji, Mei, Jin, Sakura, Wei).
- **The brand theme stays**: same gold/navy/cream palette, same fonts, same
  layout, same tokens. Bilingual `name` / `nameAr` fields remain on every tile
  (Arabic names of the East Asian cities).
- Currency remains **DHS** everywhere; inconsistent server strings
  ("Dawaar Dollars", "Dawaar Coins") normalize to "DHS".
- Identifiers do **not** change (slug `dawaar`, scheme, bundle ids, EAS project,
  AsyncStorage keys) so existing installs, builds, and saved data keep working.
- Out of scope: the regional challenge boards (`challenges` screen and server
  `challenges/` boards) keep their existing themes — a follow-up can re-theme
  them.

### 1.2 Board tiles

- Every purchasable tile displays, stacked:
  ```
  <City Name>
  <Price>
  ```
  Price is shown in the gold brand color; name stays cream (owner color when
  owned). Non-purchasable tiles (GO, Jail, Chance, …) keep their icon.

### 1.3 Player pointers

- Every player's board pointer has a **unique color** (server assigns one of 6
  distinct vivid colors by join order; max 6 players per game).
- The **current player's pointer pulses** (scale animation) on the board so you
  can always find whose turn it is.

### 1.4 Dice

- The dice-rolling **GIF is removed**.
- Tapping **Roll Dice** shows a clean overlay: two large dice tumble (faces
  cycle) for at least ~0.9 s, then **settle on the real result** with a clear
  "You rolled N!" total for ~0.9 s before dismissing.
- **Timing**: the token never starts hopping until the dice overlay has
  finished showing the result — no overlap, even on a fast (localhost) server.
- The last roll also stays visible in the status row, larger and with a total.

### 1.5 Landing feedback

- When a piece lands, a modal-style landing card slides up showing **what tile
  the player landed on** (name, emoji, context line: price / rent due / card
  drawn / tax). Auto-dismisses after 4 s except when the human drew a
  Chance/Community card (manual dismiss).
- **Sound effects** play on landing:
  - jail / go-to-jail → `went_to_jail.wav`
  - Chance → rising chime (`chance.wav`, generated)
  - Community Chest → falling chime (`community.wav`, generated)
  - tax → `spend_money.mp3`
  - any other tile → soft landing tick (`land.wav`, generated)
- Buying a property / paying bail plays `spend_money.mp3`; claiming the ad
  reward plays `received_money.mp3`; winning plays a victory arpeggio
  (`win.wav`, generated).

### 1.6 Winning

- When the game finishes and **you are the winner**:
  - You receive **+500 tokens** (reward points — persisted locally and mirrored
    to the server profile, same mechanism as challenge rewards). Awarded once
    per game.
  - The Game Over screen shows **confetti** and a "+500 tokens" banner.
  - Challenge games additionally keep their existing +1,000 challenge bonus.

### 1.7 Error conditions

- If the player taps **Buy** on a tile they cannot afford, an **alert** appears:
  "Not enough money — you need X DHS but only have Y DHS." The purchase is not
  attempted. (The Buy button now shows whenever the tile is purchasable, dimmed
  when unaffordable, so the rule is discoverable.)
- Server-side rule violations continue to surface via the red error banner.

### 1.8 UI fixes

- Fix the stray `w` text node in `game.tsx` before the board ScrollView (crashes
  native render: "Text strings must be rendered within a <Text> component").
- Board stays fully on-screen: size = min(screen width − 16, height cap, 440),
  centered, scrollable page; tiles must not overflow their cells (labels clip
  inside cell bounds).

### 1.9 Edge cases

- Rolling doubles: overlay plays per roll; re-roll allowed after it closes.
- Leaving the screen mid-roll must not set state after unmount.
- NPC landings reuse the same landing card + sounds.
- Sound playback is best-effort: failures (web autoplay policy, missing codec)
  never break gameplay.
- Reward points merge max(local, server) on app start (existing behavior kept).

---

## 2. Technical Planning

- **Domains touched (server, content-only — no rule changes):**
  - `domains/board/data.ts` — BOARD names/nameAr, CHANCE_CARDS,
    COMMUNITY_CARDS texts; prices/rents/indices/types unchanged so gameplay,
    long-poll `version` contract, and board layout are untouched.
  - `domains/events/cards.ts` — `go_to_medina`/`go_to_doha` actions become
    `go_to_beijing`/`go_to_jakarta` (same index targets 26 / 4, lookups by the
    new names).
  - `domains/players/types.ts` — `PLAYER_COLORS` → vivid distinct palette
    (kept in sync with client `constants/colors.ts` `players`).
  - String normalization "Dawaar Dollars/Coins" → "DHS" in `dice/roll.ts`,
    `turns/lifecycle.ts`, `economy/*`, `properties/auction.ts`, route comments.
- **No OpenAPI change**: no endpoint or schema shape changes; the win reward
  reuses the existing `POST /players/:id/reward` endpoint. No Orval regen.
- **Client:**
  - `app.json` name; copy in `app/index.tsx`, `app/lobby.tsx`, `app/game.tsx`,
    `app/privacy.tsx`, `components/Board.tsx`, `components/SubscribeModal.tsx`,
    `data/challenges.ts` (perk copy), `context/GameContext.tsx` (NPC names).
  - `components/Board.tsx`: price line in cells; `PlayerDot` (reanimated pulse)
    keyed off new `currentPlayerId` prop.
  - `app/game.tsx`: remove GIF overlay; add `DiceRollOverlay` with
    rolling → result phases; movement effect waits for the overlay to close;
    landing sounds; win sound + confetti + token banner; insufficient-funds
    alert; stray-text fix.
  - `context/GameContext.tsx`: +500 win reward effect (guarded per game).
  - New `lib/sounds.ts` — `expo-audio` fire-and-forget player cache.
  - New generated assets `assets/sounds/{land,chance,community,win}.wav`;
    delete `assets/dice.gif`.
- **Duplicated types** (`state.ts` ↔ `GameContext.tsx`): untouched — no shape
  changes.

## 3. Task Breakdown

1. Server content: board data + cards re-theme, card action renames, currency
   string normalization, player color palette; update affected tests.
2. Client rebrand copy (app.json + screens + NPC names + client color palette).
3. Board component: tile name+price, unique/animated pointers.
4. Dice: remove GIF, add overlay with result phase and movement gating.
5. Sounds: generate wav assets, `lib/sounds.ts`, hook into landing / buy /
   bail / ad / win.
6. Win flow: +500 tokens in GameContext, confetti + banner in Game Over modal.
7. Fixes: insufficient-funds alert, stray `w` text node, tile label clipping.
8. Validation.

## 4. Implementation notes

- Dice gating: `dicePhase: 'rolling' | 'result' | null` replaces
  `diceAnimating`; the position-change effect defers while `dicePhase !== null`,
  so the token hop starts only after the result was shown.
- Sounds use `createAudioPlayer` once per effect and `seekTo(0)` + `play()` on
  reuse; `setAudioModeAsync({ playsInSilentMode: true })` once, all wrapped in
  try/catch.
- Win award guard: `rewardAwardedRef` key `${gameId}_win` (challenge bonus keeps
  its `${gameId}_${challengeId}` key).

## 5. Validation

- `pnpm test:api` — suite updated for renamed tax tiles ('Harbor Tax',
  'Trade Tax') and passes; card-action tests cover `go_to_beijing` /
  `go_to_jakarta` index targets.
- `pnpm typecheck` — whole tree.
- Manual client flow: roll (overlay → result → hop), land on each special tile
  type for sounds/landing card, buy unaffordable tile → alert, win a game →
  confetti + 500 tokens persisted after app restart.
