---
name: brand_guidelines
description: Visual brand system for Eastern Tycoon, the East Asia themed Monopoly-style mobile game in artifacts/dawaar — the gold/navy/cream palette and its exact tokens, gradients, surface and border recipes, board and player colors, bilingual name/nameAr copy rules, currency formatting, and product naming. Use when building or restyling any screen, component, modal, or store-facing copy, when picking a color, or when asked what the brand looks like.
---

# Eastern Tycoon — Brand Guidelines

**Eastern Tycoon** is a Monopoly-style multiplayer board game set in East Asia.
The brand reads as *a lamplit night market seen from above*: deep navy ground,
warm cream type, and gold reserved for money, ownership, and the next action.

Source of truth for color: `artifacts/dawaar/constants/colors.ts`. This document
explains how to use those tokens; it never replaces them. If a value here and
`colors.ts` disagree, `colors.ts` wins — fix this file.

## Naming

- The player-facing name is **Eastern Tycoon** (two words, both capitalized).
  It appears in `app.json` `name`, the home screen, board center, lobby,
  premium/ads copy, and `app/privacy.tsx`.
- **Identifiers never changed in the rebrand and must not change now**: Expo
  slug and scheme `dawaar`, bundle ids `com.qamarlabs.dawaar`, the EAS project
  id, package name `@workspace/dawaar`, and AsyncStorage keys. Existing installs
  and saved games depend on them. Rename copy, never identifiers.
- Never write "Dawaar" in user-facing copy. The word survives only in
  identifiers and repo paths.

## Palette

### Brand core — `Colors.<token>`

| Token        | Hex       | Use                                                      |
|--------------|-----------|----------------------------------------------------------|
| `gold`       | `#C9A84C` | Money, prices, accents, primary CTAs, selected state. Earn it — one gold element per region of the screen. |
| `warmCream`  | `#F5EDD8` | Primary text on dark ground. The default text color.      |
| `darkBg`     | `#080F1A` | Screen background, and the label color *on top of* a gold CTA. |
| `cardBg`     | `#111827` | Card, panel, and modal surfaces.                          |
| `borderColor`| `#1E2D42` | Hairline borders and dividers on those surfaces.          |
| `deepNavy`   | `#0D1B2A` | Secondary dark ground, gradient midpoints.                |
| `richBlue`   | `#1B3A6B` | Rare structural accent (headers, emphasis fills).         |

Gold on `darkBg` and cream on `darkBg` both clear WCAG AA for body text. Gold on
`cardBg` is fine for text at 13px and up; below that, use cream.

### Text ramp

Cream is primary. Secondary and disabled text use neutral grays, not dimmed
cream:

- `#9CA3AF` — secondary / supporting text, descriptions, helper lines
- `#6B7280` — tertiary / captions, token labels, low-emphasis meta
- `#4B5563` / `#374151` — disabled fills and disabled gradient pairs

### Semantic

- Success / gain: `#22C55E` (bright `#4ADE80` for text on dark fills)
- Danger / loss / error: `#EF4444`
- Warning / caution: `#F59E0B`
- Info: `#3B82F6`

Money that moves is semantic, not gold: you *gain* green, you *lose* red. Gold
is for a price or a balance at rest.

### Board color groups — `Colors.groups`

`brown #8B4513`, `lightblue #38BDF8`, `pink #EC4899`, `orange #F97316`,
`red #EF4444`, `yellow #EAB308`, `green #22C55E`, `darkblue #3B82F6`.
These are gameplay signals, not decoration. Never reuse a group color as a UI
accent on the board, and never re-map one — players learn them.

### Player token colors — `Colors.players`

Six distinct vivid colors assigned by join order (max 6 players):
`#EF4444` red, `#3B82F6` blue, `#22C55E` green, `#A855F7` purple,
`#F59E0B` amber, `#06B6D4` cyan.

**This array must stay byte-for-byte in sync with `PLAYER_COLORS` in
`artifacts/api-server/src/domains/players/types.ts`.** The server assigns the
index; the client renders the color. Change one, change both in the same commit.

## Gradients

One gradient pair carries every primary action:

```tsx
<LinearGradient colors={[Colors.gold, '#A07830']}>   // enabled
<LinearGradient colors={['#4B5563', '#374151']}>      // disabled
```

Label on a gold gradient is `Colors.darkBg`, bold — never cream, never white.

Screen-level ambience uses a navy three-stop wash:

```tsx
<LinearGradient colors={[Colors.darkBg, '#0A1628', Colors.darkBg]}
                style={StyleSheet.absoluteFill} />
```

Don't invent new gradient pairs. If an action needs to stand apart from the gold
CTA, make it a bordered ghost button on `cardBg`, not a second gradient.

## Surfaces

The standard card:

```tsx
{ backgroundColor: Colors.cardBg,
  borderWidth: 1, borderColor: Colors.borderColor,
  borderRadius: 12, padding: 14 }
```

Radius scale in use: **8** (chips, badges, inputs), **12** (cards — the default),
**14–16** (modals and large panels), **20** (hero panels), **999** (pills and
circular tokens). Pick from that set; don't introduce new radii.

## Typography

Inter, four registered weights, referenced by `fontFamily` only. The full rules —
weight names, the type scale, and how to add a weight — live in the
**`preferred_fonts`** skill. Read it before styling text.

## Bilingual content

Every board tile, property, and themed content object carries both `name` and
`nameAr`. This is a brand requirement, not an i18n afterthought:

- Add both fields whenever you add content, on the server
  (`domains/board/data.ts`) and anywhere the client duplicates the type.
- The Arabic line renders smaller and in `gold` beneath the English name
  (see `regionTitleAr` / `countryCardTitleAr` in `app/challenges.tsx`).
- The UI chrome is English and LTR. `I18nManager` RTL is not enabled — Arabic
  appears as paired content, not as a translated interface. Don't flip layout.

## Currency

In-game money is **DHS**. Always `value.toLocaleString()` followed by a space and
`DHS` — `2,000 DHS`. Never `$`, never "Dawaar Dollars" or "Dawaar Coins" (those
strings were normalized away; don't reintroduce them). Reward points are
`pts`, prefixed with ⭐ in challenge copy.

## Voice

Short, warm, concrete. Say what happened and what it cost: *"Owned by Mei — Pay
420 DHS"*, *"Not enough money — you need 1,200 DHS but only have 340 DHS."* Use
an em dash to join the fact and its consequence. Avoid exclamation marks except
on genuine wins (*"You rolled 9!"*, *"Collect 2,000 DHS!"*). No casino slang, no
hype.

## Checklist

- [ ] Colors come from `Colors.*`; a new literal hex is a deliberate, commented exception
- [ ] Exactly one gold CTA in the primary region of the screen
- [ ] Text is cream → `#9CA3AF` → `#6B7280`, never opacity-dimmed cream
- [ ] Gains green, losses red, balances gold
- [ ] Card = `cardBg` + 1px `borderColor` + radius from the scale
- [ ] New content ships `name` **and** `nameAr`
- [ ] Money formatted `n.toLocaleString() + ' DHS'`
- [ ] Copy says "Eastern Tycoon"; identifiers still say `dawaar`
- [ ] `Colors.players` still matches server `PLAYER_COLORS`
