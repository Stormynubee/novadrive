# Design System: NovaDrive Mobile (Night-Highway HUD)

**Source:** Stitch export `stitch_nova_drive_mobile_interface/night_highway_hud/DESIGN.md`  
**Reference screens:** `drive_dashboard`, `journey_telemetry_init`, `journey_departure_transition_2`

## 1. Visual Theme & Atmosphere

A **nocturnal highway HUD** — calm authority, not panic UI. Dark void backgrounds with amber navigation actions and cyan live telemetry. Glass-tonal cards with thin borders, no drop shadows. Bottom tab bar uses amber squircle for the active drive tab.

## 2. Color Palette & Roles

| Name | Hex | Role |
|------|-----|------|
| Void Navy | `#0c1321` | App background |
| Surface Low | `#151b2a` | Tab bar, secondary tiles |
| Surface High | `#232a39` | Hero cards |
| Signal Amber | `#fbbf24` | Primary CTAs, active tab, Start Journey |
| On Amber | `#6c4f00` | Text on amber buttons |
| Telemetry Cyan | `#5de6ff` | Live GPS, speed, progress fills |
| System Mint | `#82fbca` | “System secure” status dot |
| Ice Text | `#dce2f6` | Primary copy |
| Warm Fog | `#d3c5ac` | Secondary copy |
| Error Rose | `#ffb4ab` | SOS accents |

## 3. Typography

- **Sora / Syne** — wordmark, headlines, speed display  
- **DM Sans** — body  
- **JetBrains Mono** — labels (`SYS.CHECK`, `km / h`, step headers)

## 4. Component Stylings

- **Start Journey:** Single amber button *inside* hero card — no duplicate outer box  
- **Dashboard header:** Hex icon + NOVADRIVE + “System secure” (not “Co-pilot ready”)  
- **Bottom tabs:** Speed (drive), Explore, History, Settings — amber fill when active  
- **Telemetry init:** Reticle circles + modal card + thin cyan progress (not misaligned dot-line)  
- **Journey HUD:** Large cyan speed, Impact watch + Voice watch shields, Test impact / Test scream pills, red Hold SOS  

## 5. Layout Principles

16px mobile gutters, 96px bottom inset for tab bar, hero card 24px padding, action grid 2 columns for SOS + QR only. Settings and profile via tab + stack screens.
