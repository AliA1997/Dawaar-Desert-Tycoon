# Phase 2 — Game-Feel & Onboarding Polish

Status: **Specification** (SDD phase 1). This document defines observable, testable
behavior for a batch of beta polish items. It is scoped to the Expo client
(`artifacts/dawaar`) except where a board rename touches server board data.

## Glossary / current state (read before implementing)

- **Board rendering** lives in [components/Board.tsx](../artifacts/dawaar/components/Board.tsx)
  (`GameBoard`, `BoardCell`). The board is a 28-tile layout; cell size is derived from
  the smaller of screen width/height and hard-capped at 440px (`boardSize` in `GameBoard`).
- **Group colors** are `GROUP_COLORS` in [Board.tsx](../artifacts/dawaar/components/Board.tsx#L8)
  and `Colors.groups` in [constants/colors.ts](../artifacts/dawaar/constants/colors.ts#L27).
- **Player token colors** are `Colors.players` in
  [constants/colors.ts](../artifacts/dawaar/constants/colors.ts#L39). **These currently
  collide with group colors** (player Red `#EF4444` == group red, player Blue `#3B82F6`
  == group darkblue, player Green `#22C55E` == group green).
- **A landing popup already exists** in [app/game.tsx](../artifacts/dawaar/app/game.tsx#L645)
  (the "Landing card" overlay: a suspense phase then a reveal phase, driven by
  `suspenseCard`/`landingCard`). Phase 2 *enhances* this, it does not build it from scratch.
- **Dice today**: a static `assets/dice.gif` (`DICE_GIF`) and a `DiceDisplay` component
  render the last roll in [app/game.tsx](../artifacts/dawaar/app/game.tsx#L40). There is
  no animated/3D roll.
- **Win state**: `GameState.winnerId` + `status: 'finished'` already exist
  ([GameContext.tsx](../artifacts/dawaar/context/GameContext.tsx#L73)); game.tsx already
  branches on `status === 'finished'`. No win celebration UI exists yet.
- **Haptics** (`expo-haptics`) are already wired. **There is no audio dependency** and no
  sound assets in the repo.
- **There is no first-launch / onboarding flag** and no confetti/onboarding library.

## Non-goals

- No changes to server game **rules** or `GameState` shape (the only server touch is the
  Free Parking → Picnic display-name rename in board data).
- No `lib/api-spec/openapi.yaml` change is required (no new endpoints; rename is a string
  value, not a schema change).
- True GPU/WebGL 3D dice (`expo-gl`/three.js) is **out of scope** for the beta; see F7 for
  the agreed pseudo-3D approach.

## New dependencies (subject to the supply-chain rules in CLAUDE.md)

All new packages must respect `minimumReleaseAge: 1440`; pin shared versions via the
catalog where one exists.

- **Audio** (F8–F10): `expo-audio` (the Expo 54 audio module; `expo-av` is deprecated).
- **Confetti** (F13): `react-native-reanimated` is already present — prefer building
  confetti on it to avoid a new dependency. If a library is preferred, flag for approval
  before adding.
- **Sound assets**: add `.mp3`/`.m4a` files under `artifacts/dawaar/assets/sounds/`
  (`land.mp3`, `jail.mp3`, `money.mp3`). These must be committed; reference royalty-free
  sources.

---

# Game Board

## F1 — Larger board cells
**Behavior:** Each tile is visually larger and its label more legible than today. Also put the cost below the name of the tile, only if it has a cost. 
**Details:**
- Increase the per-cell footprint and the `nameText`/`typeIcon` font sizes in
  [Board.tsx](../artifacts/dawaar/components/Board.tsx#L131) so a property name is readable
  without squinting on a 390pt-wide phone.
- The board must still fit on screen without horizontal scroll on the smallest supported
  device (iPhone SE, 320pt wide) and must not overflow the existing scroll container.
**Acceptance:**
- On a 320pt-wide device the full board is visible with no clipping and no horizontal
  scroll.
- Property short-names render on one line (or auto-shrink, never truncate to empty).
- Player dots, owner badge, and house/hotel markers remain inside the cell bounds.

## F2 — "You landed on" popup (enhance existing)
**Behavior:** Whenever **any** piece (only human) finishes a move, the landing overlay
shows what was landed on. This already exists; Phase 2 ensures it fires for every landing
and pairs it with the F8 sound.
**Success path:**
- Player lands on a property → overlay shows tile name, group stripe, and context
  (price / owner / rent) as it does today.
- Player lands on Chance/Community → overlay shows the drawn card text.
- Player lands on a special tile (GO, Jail, Picnic, Go-to-Jail, Tax) → overlay shows the
  tile name and its effect.
**Edge cases:**
- Overlays queue or coalesce so rapid NPC turns do not stack/flicker; the most recent
  landing wins.
- For my own Chance/Community card the overlay stays until dismissed (current behavior);
  for non-blocking landings it auto-dismisses.
**Acceptance:** Every landing for every player produces exactly one overlay; the F8 land
sound plays at the moment the reveal appears.

## F3 — Animated active token
**Behavior:** The token of the player whose turn it is (the "active pointer") is visually
animated so it's obvious whose piece is where.
**Details:**
- The active player's dot on its current tile pulses/glows (scale or opacity loop via
  `react-native-reanimated`) — distinct from idle tokens.
- When a token moves between tiles after a roll, it animates along positions rather than
  teleporting (a stepwise tween is acceptable; per-pip walking is preferred but optional).
**Acceptance:**
- Exactly one token is in the "active" animated state at a time (the current turn's
  player), and it stops animating when the turn passes.
- Animations run on the UI thread (worklets) and do not drop the board below ~50fps.

## F4 — Distinct player vs. group colors
**Behavior:** Player token colors are visually unambiguous against the eight board group
colors.
**Details:**
- Replace the colliding entries in `Colors.players`
  ([colors.ts](../artifacts/dawaar/constants/colors.ts#L39)) so **no player color equals
  any `Colors.groups` value**, and adjacent player colors are distinguishable.
- Player tokens should additionally carry a non-color affordance (e.g. the token image
  from `assets/tokens/` or an initial) so colorblind users can still tell players apart.
**Acceptance:**
- Automated/manual check: `Colors.players ∩ Object.values(Colors.groups) === ∅`.
- In a 6-player game, all six tokens are distinguishable from each other and from every
  group stripe.

## F5 — Animated dice-roll popup
**Behavior:** Rolling the dice opens a popup that visibly animates the roll before
settling on the result.
**Success path:** Tapping Roll → modal appears → dice tumble/shake for ~600–1000ms →
settle on the two server-returned face values → modal auto-closes (or the landing reveal
takes over).
**Edge cases:**
- The animation never changes the outcome: the settled faces must equal the dice values
  returned by `rollDice()` ([GameContext.tsx](../artifacts/dawaar/context/GameContext.tsx#L747)).
- Doubles still trigger the existing "roll again" flow after the popup closes.
- If the roll request errors, the popup closes and the existing error banner shows.
**Acceptance:** Faces shown == server values 100% of the time; popup is dismissed before
the next action is allowed.

## F6 — Free Parking → "Picnic"
**Behavior:** The Free Parking corner is renamed to **Picnic** everywhere it's shown, in
both languages. Tile **type stays `free_parking`** (rules unchanged) — this is a
display-name change only.
**Details (all must change together):**
- Board data name/`nameAr`: [data.ts:117](../artifacts/api-server/src/domains/board/data.ts#L117),
  [builder28.ts:73](../artifacts/api-server/src/domains/board/builder28.ts#L73),
  [challengeBoards.ts:44](../artifacts/api-server/src/domains/board/challengeBoards.ts#L44)
  → `name: 'Picnic'`, `nameAr: 'نزهة'`.
- The `free_parking` glyph in `SPECIAL_LABELS`
  ([Board.tsx:20](../artifacts/dawaar/components/Board.tsx#L20)) → a picnic icon (e.g. 🧺)
  instead of `'P'`.
- Any landing-context / emoji mapping in game.tsx for `free_parking`.
**Acceptance:** No user-visible "Free Parking" / "وقوف مجاني" string remains; the corner
reads "Picnic"/"نزهة"; `pnpm test:api` still passes (rule behavior unchanged).

## F7 — "3D" dice in the roll popup
**Behavior:** The dice in the F5 popup read as three-dimensional cubes that tumble, rather
than a flat gif.
**Agreed approach:** pseudo-3D using `react-native-reanimated` (rotateX/rotateY/perspective
transforms on cube faces) — **no** `expo-gl`/WebGL dependency for the beta.
**Acceptance:** Two cube dice visibly rotate in 3D during the roll and land on the correct
face values (per F5). Same fps budget as F3.

> F5 and F7 ship together: F7 is the visual treatment of the F5 popup.

---

# Sound

General rules for all sounds:
- Use a single shared audio service/hook (e.g. `hooks/useSound.ts`) that loads sounds once
  and plays them fire-and-forget.
- Respect the device **silent switch** and never block gameplay on audio.
- A user setting to **mute SFX** must exist (persisted), defaulting to on. Honor it for all
  three sounds.
- Sounds are short (<1.5s) and do not overlap destructively (re-trigger restarts the clip).

## F8 — Landing sound
**Behavior:** A sound plays each time a piece lands on a tile, synced to the F2 reveal.
**Acceptance:** Every landing reveal plays `land.mp3` once (subject to mute); no sound when
muted.

## F9 — Jail sound
**Behavior:** When a player is sent to / lands in jail, a "cell door closing" sound plays.
**Trigger:** player transitions to `inJail === true`
([GameContext.tsx](../artifacts/dawaar/context/GameContext.tsx#L16)) — via Go-to-Jail tile,
a card, or three doubles.
**Acceptance:** `jail.mp3` plays exactly once on the jail transition (not on subsequent
turns spent in jail), subject to mute.

## F10 — Money-collected sound
**Behavior:** A "cha-ching" sound plays whenever **my** player's money increases (passing
GO, rent received, ad reward, card payout, winning an auction refund, etc.).
**Trigger:** detect a positive delta in my player's `money` between state versions.
**Edge cases:** Do not play on money decreases; coalesce simultaneous increases into one
play; only for the local player (not NPCs).
**Acceptance:** `money.mp3` plays once per net increase of the local player's balance,
subject to mute.

---

# New Additions

## F11 — First-launch detection
**Behavior:** The app knows whether this is the first time the app has been opened on this
device.
**Details:** Persist a boolean flag (e.g. `dawaar.onboarding.seen`) via
`@react-native-async-storage/async-storage`. Read it on app start
([app/index.tsx](../artifacts/dawaar/app/index.tsx) / root `_layout.tsx`).
**Edge cases:** Storage read failure is treated as "new user" (safe default → guide shown).
Reinstall resets the flag (acceptable).
**Acceptance:** Flag is `false`/absent on a fresh install and `true` after the guide is
dismissed; it survives app restarts.

## F12 — First-launch how-to-play guide
**Behavior:** A new user (F11) is shown a "How to play" guide before/at the first menu.
**Details:**
- Multi-step or scrollable guide covering: objective, rolling & moving, buying/building,
  rent, jail, trading, and winning.
- Bilingual (English + Arabic), consistent with existing UI.
- Dismissing it (Skip or Done) sets the F11 flag so it does not show again.
- Accessible later from a menu entry (so returning users can reopen it).
**Acceptance:** Guide appears automatically only on first launch; never reappears
automatically after dismissal; is reachable on demand thereafter.

## F13 — Win celebration
**Behavior:** When the game ends with a winner, show confetti and a "You won!" (or
"<name> won!") celebration.
**Trigger:** `status === 'finished'` && `winnerId` set
([GameContext.tsx](../artifacts/dawaar/context/GameContext.tsx#L73), already branched on in
game.tsx ~L414).
**Details:**
- If `winnerId === myPlayerId`: confetti + celebratory "You won!" message + the F10/F13
  victory feel.
- If another player won: a non-confetti "<name> won" result screen (or muted confetti) is
  acceptable — confetti emphasis is for the local winner.
- Provide a clear path back to the main menu from the celebration.
**Acceptance:** Confetti animates on local-player win; the correct winner name is shown;
the celebration is dismissable and routes home; it does not fire mid-game or on a
non-finished state.

---

## Validation (SDD phase 5)

- `pnpm typecheck` clean across the monorepo.
- `pnpm test:api` passes (proves F6 changed only display names, not rules). Add/adjust a
  board test asserting the index-14 tile keeps `type: 'free_parking'` while `name` is
  `'Picnic'`.
- Manual client pass on the smallest and a large device for F1/F3/F5/F7 layout & fps.
- Manual audio pass with mute on and off (F8–F10), and silent-switch behavior.
- Fresh-install pass for F11/F12; full-game-to-win pass for F13.

## Open questions (resolve before phase 4)

1. Confetti: build on reanimated (preferred, no new dep) or add a library?
2. Token affordance for F4 — reuse `assets/tokens/*.png`, or initials, or both?
3. Sources/licenses for the three sound assets.
4. Should the SFX mute setting be a new Settings screen or folded into an existing menu?
