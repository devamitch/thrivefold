---
name: thrivefold-design-system
description: Thrivefold's visual and UX rules — calm eye-friendly palettes per experience, contrast checking, Geist typography, Ionicons, the 2+2 dock with the Thrive orb, onboarding scaffold, motion and copy. Use for any screen, component, colour, icon, layout or "make it look better" task.
---

# Design system

Spec: master prompt §2 (brand/UX), §26 (screens), §34 (tokens). Goal: modern, calm,
editorial, warm — no gradient washes, glassmorphism, badge overload, emoji or stray logos.

## Colour

- Only tokens from `useTheme().colors`; never raw hex in screens.
- `src/theme/colors.ts` builds all six palettes from one `palette()` recipe:
  women = clay `#A0583F` + sage; men = slate teal `#2E5C62` + sand; pride = deep gold
  `#7E5C1E` + plum, with `QUIET_RAINBOW` used only as a thin accent.
- Canvases are warm off-white (light) / warm near-black (dark), never pure #FFF/#000.
- Status colours are muted (`success #43704F`, `error #B0503F`…), never neon Tailwind.
- **Check contrast before committing a colour change** (≥4.5:1 body/caption, ≥3:1 large):

```python
def L(h):
    c=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    c=[x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4 for x in c]
    return .2126*c[0]+.7152*c[1]+.0722*c[2]
cr=lambda a,b:(max(L(a),L(b))+.05)/(min(L(a),L(b))+.05)
print(cr('#6F655E','#F0EAE3'))  # muted text on surface1 -> must be >= 4.5
```

## Type and icons

- Typography tokens in `src/theme/typography.ts` use Geist (shared with BlinkQuest/Neev),
  embedded by the `expo-font` plugin. Each weight is a family (`Geist-SemiBold`); don't add
  `fontWeight` on top. Adding a font = add to `app.json` plugin + prebuild + rebuild.
- Icons: `@expo/vector-icons` Ionicons, outline for inactive, filled for active. No emoji
  anywhere in UI text, labels, alerts or data constants.
- Brand mark appears on sign-in and app icon/splash only — not as decoration inside screens.

## Navigation and layout

- Dock (`CustomTabBar`): exactly four tabs, two each side — Home, Today | **Thrive orb**
  (opens today's check-in) | Progress, You. Colours from `colors.dock/dockActive/dockMuted`.
- Other destinations are pushed screens under `src/app/(app)/` reached from Home/You.
- Onboarding uses `OnboardingScaffold` (progress, back, Skip, title, pinned primary).
- Cards: `Card`/`SquircleSurface`, `borderCurve: 'continuous'`, hairline borders.
- Touch targets ≥44dp; primary action visible without scrolling or pinned.

## Every screen must be meaningful

Before shipping a screen answer: what is it for, what's the one primary action, what does
it show with no data (empty state with a real next step), on error (message + retry), and is
every number from the person's own records? If a screen can't answer these, fold it into
another or remove it.

## Motion and copy

- Reanimated, subtle, reduced-motion aware; no infinite loops on always-visible elements.
- Copy is plain and honest: short sentences, no hype ("revolutionary", "sanctuary"), no
  claims about servers, reviewers or AI that don't exist. Health copy carries "not medical
  advice" where it estimates anything.
