---
name: Nova Drive
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c1c6d7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8b90a0'
  outline-variant: '#414755'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e69'
  primary-container: '#4b8eff'
  on-primary-container: '#00285c'
  inverse-primary: '#005bc1'
  secondary: '#e9b3ff'
  on-secondary: '#510074'
  secondary-container: '#7d01b1'
  on-secondary-container: '#e5a9ff'
  tertiary: '#ffb595'
  on-tertiary: '#571e00'
  tertiary-container: '#ef6719'
  on-tertiary-container: '#4c1a00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#f6d9ff'
  secondary-fixed-dim: '#e9b3ff'
  on-secondary-fixed: '#310048'
  on-secondary-fixed-variant: '#7200a3'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb595'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7c2e00'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-metrics:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  touch-target-min: 48px
  floating-offset: 24px
---

## Brand & Style

This design system is engineered for the high-performance driver, blending data-rich telemetry with a sleek, futuristic aesthetic. The brand personality is precise, authoritative, and visionary, designed to evoke the feeling of a high-tech cockpit rather than a standard mobile app.

The visual style utilizes **Modern Glassmorphism** mixed with **High-Tech Minimalism**. This approach prioritizes low-glare usability for night driving while maintaining a premium, "heads-up display" (HUD) feel. Interfaces are built on deep, light-absorbing surfaces contrasted with vibrant, glowing accents that signal priority information instantly. High-performance data visualization is integrated directly into the spatial layout, ensuring that complex navigation and vehicle metrics remain legible at a glance.

## Colors

The palette is optimized for **Default Dark Mode** to reduce driver eye strain and maximize the contrast of route paths. 

- **Nova Blue (#007AFF):** Used for the primary route, active navigation states, and primary actions. It represents reliability and precision.
- **Electric Purple (#BF5AF2):** Used for secondary metrics, drive analytics, and high-tech "power" states to differentiate data layers from navigation.
- **Status Accents:** Standardized high-visibility hues for traffic (Amber), clear paths (Green), and hazards (Red). 
- **Surface Strategy:** Backgrounds are near-black (#0A0A0A) to melt into the device hardware. Overlays use semi-transparent glass with a subtle "Nova Blue" tint to maintain depth without breaking the dark-room environment.

## Typography

Typography in this design system focuses on **instantaneous legibility**. 

- **Headlines (Sora):** A geometric sans-serif that feels futuristic and wide, perfect for street names and major navigation headers.
- **Body & UI (Geist):** A technical, highly legible typeface designed for clarity in dense data environments.
- **Data Labels (JetBrains Mono):** Used for vehicle telemetry, coordinates, and time-stamps. The monospaced nature ensures that shifting numbers (like speed or distance) do not cause layout "jitter."

Use high-contrast weights (600+) for critical driving instructions and lighter weights for secondary environmental data.

## Layout & Spacing

The layout utilizes a **Dynamic Overlay Model**. The map serves as the infinite base layer, while UI elements "float" on top in logical clusters.

- **Safe Zones:** All interactive elements must stay within a 24px inner margin to ensure they aren't obscured by phone notches or vehicle mounts.
- **Touch Ergonomics:** Because the user may be in a moving vehicle, the minimum touch target is strictly 48px. 
- **Grid:** A standard 8px square grid governs all component dimensions.
- **Visual Grouping:** Content is grouped into "Pods" (cards with glass effects). Drive analytics should reflow from a bottom-sheet on mobile to a side-panel on larger tablet/vehicle displays.

## Elevation & Depth

Hierarchy is established through **Z-axis Layering** and **Backdrop Blurs** rather than traditional drop shadows.

1.  **Level 0 (Base):** The Map/Navigation view.
2.  **Level 1 (Surface):** Semi-transparent glass containers (20px blur) for route info and secondary stats.
3.  **Level 2 (Floating):** Floating Action Buttons (FABs) and critical alerts. These use a subtle outer glow in "Nova Blue" to appear as if they are emitting light.
4.  **Level 3 (Modal):** Full-screen takeovers for vehicle diagnostics or settings, using a darker, more opaque background blur to shift focus entirely.

Edge treatment is critical: use 1px inner borders with low-opacity white (10-15%) to define the edges of glass panels against the dark map.

## Shapes

The shape language is **Streamlined and Aerodynamic**. 

- **Cards & Pods:** Use a 16px (rounded-lg) corner radius to feel modern and friendly yet structured.
- **Interactive Elements:** Buttons and input fields use a fully pill-shaped (rounded-full) geometry to differentiate them from informational containers.
- **Gauges:** Circular and semi-circular shapes are used for telemetry (Speed, RPM, Battery) to mimic traditional automotive clusters with a digital twist.

## Components

**Floating Action Buttons (FABs):** Circular icons with a 20% "Nova Blue" glow. Used for re-centering the map or voice commands.

**Route Progress Bar:** A thin, horizontal track at the top of the screen. The "filled" portion uses a gradient from Nova Blue to Electric Purple. Key milestones (stops) are marked with small, glowing white pips.

**Telemetry Gauges:** Minimalist arc-based charts for speed and fuel/charge. Use "JetBrains Mono" for the central numerical value.

**Drive Analytics Charts:** Line charts with "area fill" gradients. The line should be a crisp 2px stroke of Electric Purple with a soft glow effect.

**Vehicle Status Indicators:** Small, pill-shaped chips at the top of the UI. If a system is nominal, the icon is muted; if an error occurs, the chip pulses in "Alert Red."

**Input Fields:** Ghost-style inputs with a 1px border. When focused, the border glows in Nova Blue and the backdrop blur increases in intensity.