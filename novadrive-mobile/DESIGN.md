# Design System: Margi (Care Path)

**Product:** Margi — highway safety co-pilot (IIT Madras RoadSoS 2026)  
**Logo:** Two figures forming a heart around a winding path and EKG pulse — deep navy `#000a1e` and saffron `#fe6b00`.

## 1. Visual Theme & Atmosphere

**Care Path** — compassionate, institutional, light. Trust on white and soft gray-blue surfaces; urgency via orange, not alarm-red chrome. Rounded shapes echo the logo curves.

## 2. Color Palette & Roles

| Name | Hex | Role |
|------|-----|------|
| Canvas | `#f8f9fb` | App background |
| Surface | `#ffffff` | Cards, sheets |
| Royal Blue | `#000a1e` | Primary CTAs, wordmark, tab chrome |
| Vibrant Orange | `#fe6b00` | SOS, urgent actions, active tab accent |
| Safe Green | `#249c53` | Verified / system secure |
| Ink | `#191c1d` | Primary copy |
| Muted | `#4a5568` | Secondary copy |
| Error | `#ba1a1a` | Critical alerts |

## 3. Typography

- **Hanken Grotesk** — wordmark **Margi**, headlines
- **Public Sans** — body
- **JetBrains Mono** — journey HUD labels (`km/h`, `SYS.CHECK`)

## 4. Component Stylings

- **Primary button:** Deep navy fill, white label, 8px radius
- **Urgent button:** Orange fill (`secondary`)
- **Cards:** White surface, 12px radius, subtle blue-tint shadow
- **Splash:** White field, centered logo, tagline, orange “Get started”
- **Journey HUD (v1.6):** Fixed layout (no scroll while driving). Zones top→bottom: header → **full-width SOS strip** (`HoldSOSButton` `hudTop`, 3s hold) → sensor row → **168px** speed ring (40px digits) → end-trip CTA. Dev-only impact/scream pills behind `__DEV__`.

## 5. Layout Principles

16px gutters, 96px bottom inset for tab bar, generous whitespace on onboarding.

## 6. Logo

Use `MargiLogo` component. Do not stretch below 48px width. Clear space = height of the “M” cap height on all sides.
