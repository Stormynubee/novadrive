# GitHub banner — Night Highway HUD (2026-05-28)

## Purpose

README hero for [Stormynubee/novadrive](https://github.com/Stormynubee/novadrive): institutional GovTech credibility for IIT Madras RoadSoS judges, not a generic hackathon gradient.

## Aesthetic

**Night Highway Command Strip** — void navy canvas, amber shoulder geometry, cyan telemetry accents, mono HUD labels. Matches mobile [DESIGN.md](../../../novadrive-mobile/DESIGN.md).

## Tokens

| Token | Hex | Use |
|-------|-----|-----|
| Void Navy | `#0c1321` | Background |
| Signal Amber | `#fbbf24` | Primary accent, 60s arc, shoulder |
| Telemetry Cyan | `#5de6ff` | Grid, labels, signal bars |
| System Mint | `#82fbca` | Live / secure indicators |
| Ice Text | `#dce2f6` | Headline |

## Assets

| File | Role |
|------|------|
| `docs/assets/banner.svg` | Source (1280×320) |
| `docs/assets/banner.png` | README embed — regenerate with `node scripts/render-banner.mjs` |
| `docs/assets/banner-light.svg` | Light-theme variant |

## Stitch-style prompt (if re-exporting)

Night-highway HUD GitHub banner 1280×320. Void navy `#0c1321`, subtle cyan grid, diagonal amber shoulder band, perspective dashed NH lanes at bottom. Left: mono eyebrow "MARGI · ROAD SOS 2026", large "Margi", split tagline "Signal drops." (warm gray) + "The critical minute does not." (amber). Glass pills: Team NovaDrive, IIT Madras RoadSoS, SDK 54 amber, GHP·QR·108 mint outline. Right: HUD corner brackets, golden-hour 60-second arc with "60 SEC CALM", cyan signal meter, "SYS.SECURE · VOICE WATCH" strip. Institutional, calm authority, no purple gradients.
