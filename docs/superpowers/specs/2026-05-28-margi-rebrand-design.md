# Margi rebrand — design spec (2026-05-28)

## Goal

Replace **Margi** with **Margi** as the shipped product identity across mobile, web mirror, GitHub README/banner, and judge docs. Adopt the **Care Path** visual system from the heart/path/EKG logo (royal blue + vibrant orange on light backgrounds).

## Native identifiers

| Field | Value |
|-------|-------|
| Display name | Margi |
| iOS bundle ID | `com.margi.app` |
| Android package | `com.margi.app` |
| URL scheme | `margi://` |
| Expo slug | `novadrive-mobile` (folder name unchanged for git continuity) |

**Migration:** `npx expo prebuild --clean` then fresh install. Old `com.margi.app` installs remain side-by-side.

## Color tokens (Care Path)

| Token | Hex | Role |
|-------|-----|------|
| Primary blue | `#0056b3` | Brand chrome, primary CTAs, wordmark |
| Accent orange | `#ff8c00` | Urgent action, SOS, active states |
| Background | `#f8f9fb` | App canvas |
| Surface | `#ffffff` | Cards, sheets |
| On primary | `#ffffff` | Text on blue buttons |
| On secondary | `#ffffff` | Text on orange buttons |
| Tertiary (safe) | `#249c53` | Verified / safe status |
| Error | `#ba1a1a` | Critical alerts |

## Typography

- **Hanken Grotesk** — wordmark and headlines
- **Public Sans** — body
- **JetBrains Mono** — HUD labels (journey telemetry)

Wordmark: single word **Margi** (not split NOVA/DRIVE).

## Logo usage

- Source asset: `novadrive-mobile/assets/margi-logo-source.png` when available
- In-app: `MargiLogo` component (SVG approximation or raster via `expo-image`)
- Minimum clear space: 8px around mark on light surfaces
- Splash: centered mark + tagline + orange “Get started” CTA on `#ffffff`

## Tagline

**When signal drops, the path still holds.**

(Legacy hackathon line “Signal drops. The critical minute doesn't.” may appear in README footnotes only.)

## Brand module (`src/lib/brand.ts`)

Single source for:

- `APP_DISPLAY_NAME`, `APP_TAGLINE`
- `GHP_SMS_HEADER` = `MARGI GHP`
- `GHP_HASH_PREFIX` = `mg`
- `permissionCopy.*` for app.json strings
- `LEGACY_GHP_HEADERS` for backward compatibility

## GHP / QR compatibility

| Item | New | Legacy (still accepted) |
|------|-----|-------------------------|
| SMS header | `MARGI GHP` | `MARGI GHP` (decode only) |
| Integrity hash prefix | `mg-xxxxxxxx` | `nd-xxxxxxxx` |
| QR envelope | `ND1:` (unchanged) | — |

## Component renames

| Old | New |
|-----|-----|
| NovaButton | MargiButton |
| NovaInput | MargiInput |
| NovaTopBar | MargiTopBar |
| NovaTabBar | MargiTabBar |
| NovaQuickMenuSheet | MargiQuickMenuSheet |
| NovaLogo | MargiLogo |

`Hud*` components remain (generic telemetry chrome).

## Out of scope

- GitHub repo rename `Stormynubee/novadrive`
- AsyncStorage keys `nd_*`
- Rewriting `VERSION_HISTORY.md` commit messages

## Smoke matrix

Update document title and any Margi references to Margi. Functional flows unchanged.

## Verification

- `npm test` — brand + ghp + tokens tests
- `npm run typecheck`
- Device smoke rows 1–5, 13–15, 23–26 on `com.margi.app`
- QR round-trip with `MARGI GHP` SMS text
