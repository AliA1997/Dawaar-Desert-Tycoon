---
name: preferred_fonts
description: Typography rules for Eastern Tycoon, the React Native/Expo game client in artifacts/dawaar — the Inter family and its four registered weights, why styles set fontFamily instead of fontWeight, the type scale and label/caption conventions, how to register a new weight, and how Arabic nameAr text renders. Use when writing or editing any Text style, adding a font weight, or choosing a font size.
---

# Eastern Tycoon — Preferred Fonts

The app uses **Inter** and nothing else. It is loaded from
`@expo-google-fonts/inter` and registered in `artifacts/dawaar/app/_layout.tsx`.

## The four registered weights

```tsx
const [fontsLoaded, fontError] = useFonts({
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
});
```

| Family string        | Role                                                         |
|----------------------|--------------------------------------------------------------|
| `Inter_400Regular`   | Body copy, descriptions, log lines, input text               |
| `Inter_500Medium`    | Light emphasis — Arabic subtitles, small meta, slider labels  |
| `Inter_600SemiBold`  | Uppercase labels, section headers, tab labels                 |
| `Inter_700Bold`      | Screen titles, card titles, money, button labels, badges      |

Only these four are loaded. **A `fontFamily` string that isn't in that map fails
silently** — Android falls back to the system font and the text just looks wrong
in a release build. If you need another weight, register it first (see below).

## The rule: `fontFamily`, never `fontWeight`

```tsx
// right
title: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.warmCream }

// wrong — Android does not synthesize a bold from a named static family
title: { fontSize: 22, fontFamily: 'Inter_400Regular', fontWeight: '700' }
```

Named static families carry their own weight. Adding `fontWeight` on top is
either ignored or produces a faux-bold that doesn't match the real face, and the
two platforms disagree about which. Set the family; leave `fontWeight` out.

**Known exceptions** (leave them alone): `app/+not-found.tsx` and
`components/ErrorFallback.tsx` use bare `fontWeight` on the system font on
purpose. The tree renders behind the splash *before* `useFonts` resolves and is
also what shows when font loading itself failed, so those two surfaces must not
depend on Inter being present.

## Type scale

Pick from this scale; don't invent sizes between the steps.

| px | Weight              | Role                                                      |
|----|---------------------|-----------------------------------------------------------|
| 22 | `Inter_700Bold`     | Screen title, big card title, modal title                 |
| 18 | `Inter_700Bold`     | Card title, list-section heading                          |
| 16 | `Inter_700Bold`     | Primary button label                                      |
| 15 | `Inter_400Regular`  | Text input, emphasized body                               |
| 14 | `Inter_400Regular` / `Inter_700Bold` | Body; bold for a name or amount    |
| 13 | `Inter_400Regular`  | Secondary body, descriptions, helper text (`lineHeight: 19`) |
| 12 | `Inter_600SemiBold` | Uppercase label / section title (see below)               |
| 11 | `Inter_400Regular`  | Caption, count badge                                      |
| 10 | `Inter_500Medium`   | Token label, tightest meta                                |

Above 22px is display type — the dice total, the money readout, the Game Over
headline (28 / 32 / 36 / 40+). Always `Inter_700Bold`, always a number or a
single short word.

Set `lineHeight` on any text that wraps: roughly **1.45×** the size
(13 → 19, 14 → 20, 15 → 22). Single-line labels don't need it.

## Labels and captions

Uppercase micro-labels are one fixed recipe — match it exactly:

```tsx
label: {
  fontSize: 12,
  fontFamily: 'Inter_600SemiBold',
  color: '#9CA3AF',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}
```

`letterSpacing: 0.5` is used **only** with `textTransform: 'uppercase'`. Never
letter-space lowercase body text.

## Color pairings

Type color comes from the `brand_guidelines` skill: `Colors.warmCream` for
primary, `#9CA3AF` for secondary, `#6B7280` for tertiary, `Colors.gold` for
money and accents, `Colors.darkBg` for a label sitting on a gold gradient.
Never dim cream with `opacity` to make secondary text — step down the ramp.

## Adding a weight

1. Import it in `app/_layout.tsx` from `@expo-google-fonts/inter` (e.g.
   `Inter_800ExtraBold`).
2. Add it to the `useFonts` map.
3. Use the exact string as `fontFamily`.
4. Update the table above.

Each weight is a font file shipped in the bundle, so add one only when a real
design need exists — four is deliberate. Don't add a second typeface; if a
surface needs to feel different, change size, weight, case, or color.

## Arabic (`nameAr`)

Inter ships **no Arabic glyphs**. Arabic strings fall through to the platform
system Arabic face (SF Arabic on iOS, Noto Naskh on Android) for those
codepoints, so:

- `fontSize`, `color`, and layout apply normally to Arabic text.
- The *weight* you set is not reliably honored — the fallback face picks its own.
  Don't lean on weight to distinguish an Arabic line; the existing pattern uses
  a smaller size in `Colors.gold` instead (`regionTitleAr`, `countryCardTitleAr`
  in `app/challenges.tsx`).
- Give Arabic lines a little more vertical room; Naskh sits taller than Latin at
  the same `fontSize`.
- Keep setting `fontFamily` on mixed English/Arabic `Text` — the Latin
  characters still need it, and the fallback handles the rest.

## Loading behavior

`useFonts` gates only `SplashScreen.hideAsync()`, and `fontError` hides the
splash too. The app deliberately launches rather than hanging on a font failure,
which is exactly why the error surfaces above avoid Inter. Don't change
`_layout.tsx` to block rendering on `fontsLoaded`.

## Checklist

- [ ] Every `Text` style sets `fontFamily` from the four registered strings
- [ ] No `fontWeight` outside the two documented exceptions
- [ ] Size comes from the scale; wrapping text has a `lineHeight`
- [ ] `letterSpacing: 0.5` only alongside `textTransform: 'uppercase'`
- [ ] A new weight was added to `useFonts` before being used
- [ ] Arabic lines don't depend on weight to read as distinct
