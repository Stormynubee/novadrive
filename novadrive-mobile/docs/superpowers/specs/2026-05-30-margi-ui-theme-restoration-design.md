# Margi UI Theme Restoration — Design Spec

**Date:** 2026-05-30  
**Status:** Approved (implementation authorized)  
**Product:** Margi (Team NovaDrive · IIT Madras RoadSoS)

## Goal

Restore the NovaDrive-era deep navy + saffron visual identity on the Margi product, fix reported layout overlaps and button press feedback, unify logo usage, and make emergency auto mode feel hands-off.

## Branding

- **App name:** Margi (unchanged)
- **Header:** Margi wordmark + `MargiLogoMark` (not MaterialIcons heart/shield)
- **Palette:** Deep Navy primary chrome, Emergency Saffron for urgent actions
- **Team credit:** "Team NovaDrive" allowed in footers only (public branding rules)

## Color tokens

| Token | Hex | Role |
|-------|-----|------|
| `primary` | `#000a1e` | Headers, primary CTAs, tab chrome |
| `primaryDeep` | `#000714` | Pressed primary buttons |
| `onPrimaryContainer` | `#000714` | Dark navy on light containers |
| `primaryContainer` | `#e8edf5` | Active tab tint (cool gray-blue, not sky wash) |
| `secondary` | `#fe6b00` | SOS, urgent actions |
| `secondaryDeep` | `#a04100` | Pressed secondary buttons |
| `onSurface` | `#191c1d` | Primary copy |
| `innerHighlight` | `rgba(0,10,30,0.06)` | Subtle blue tint on surfaces |

## Logo unification

- `MargiTopBar`: replace `MaterialIcons favorite` with `MargiLogoMark` (28px)
- `emergency/activation`: replace shield icon with `MargiLogo` (~80px, no wordmark)
- Splash/auth/onboarding already use `MargiLogo` — no change

## Button press states

- **Do not** use `opacity` on filled primary/secondary buttons (reads as grey wash on white)
- **Do** use `backgroundColor: tokens.primaryDeep` / `secondaryDeep` on press
- Ghost buttons: darken border, no opacity fade

## Auth tabs

- Row 1: Sign in | Create account (equal split, no mid-word wrap)
- Row 2: Guest demo (full width)
- Active: navy fill + white text; inactive: white + navy border

## SOS hold button (`hudTop`)

Stack layout — no absolute positioning for sublabel:

```
[icon]  HOLD FOR SOS
        Hold 3 seconds
```

## Emergency activation

### Layout

- `ScrollView` for main content; footer pinned below (Cancel SOS never overlaps Continue)
- Remove `justifyContent: 'center'` cramming

### Auto mode UX

- Default: auto mode
- Countdown ring around logo (`secondsLeft / ACTIVATION_SPLASH_SECONDS`)
- Label: `Auto-advancing in Ns` (saffron mono)
- Hide manual Continue until `secondsLeft <= 3` or user taps "Switch to manual"
- Mode toggle: subtle "Switch to manual" link instead of two equal mode buttons
- Auto-nav at `secondsLeft === 0` unchanged (`shouldNavigateToResponse`)

## Copy cleanup

Replace product-facing "Nova Drive" strings with "Margi" in selection, accessibility, quickSosAlert.

## Out of scope

- PNG launcher icon pipeline
- Dark mode
- Full emergency flow rewrite

## Verification

- `npm test` (tokens, activationUi, HoldSOSButton, MargiButton)
- `npm run verify:branding`
- Manual device check: journey HUD, auth, activation, headers
