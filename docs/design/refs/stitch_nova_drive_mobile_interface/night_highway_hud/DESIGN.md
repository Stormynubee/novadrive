---
name: Night-Highway HUD
colors:
  surface: '#0c1321'
  surface-dim: '#0c1321'
  surface-bright: '#323949'
  surface-container-lowest: '#070e1c'
  surface-container-low: '#151b2a'
  surface-container: '#19202e'
  surface-container-high: '#232a39'
  surface-container-highest: '#2e3544'
  on-surface: '#dce2f6'
  on-surface-variant: '#d3c5ac'
  inverse-surface: '#dce2f6'
  inverse-on-surface: '#2a3040'
  outline: '#9c8f79'
  outline-variant: '#4f4633'
  surface-tint: '#f9bd22'
  primary: '#ffe1a7'
  on-primary: '#402d00'
  primary-container: '#fbbf24'
  on-primary-container: '#6c4f00'
  inverse-primary: '#795900'
  secondary: '#5de6ff'
  on-secondary: '#00363e'
  secondary-container: '#00cbe6'
  on-secondary-container: '#00515d'
  tertiary: '#82fbca'
  on-tertiary: '#003827'
  tertiary-container: '#64deaf'
  on-tertiary-container: '#006045'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdf9f'
  primary-fixed-dim: '#f9bd22'
  on-primary-fixed: '#261a00'
  on-primary-fixed-variant: '#5c4300'
  secondary-fixed: '#a2eeff'
  secondary-fixed-dim: '#2fd9f4'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#004e5a'
  tertiary-fixed: '#80f9c8'
  tertiary-fixed-dim: '#62dcad'
  on-tertiary-fixed: '#002115'
  on-tertiary-fixed-variant: '#00513a'
  background: '#0c1321'
  on-background: '#dce2f6'
  surface-variant: '#2e3544'
typography:
  display-lg:
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
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-value:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
This design system captures the high-performance essence of a nocturnal driving environment. It is engineered for low-light legibility and rapid cognitive processing, mimicking a sophisticated vehicle heads-up display (HUD). The brand personality is calm yet authoritative, utilizing a "Darker-than-Black" foundation to let critical telemetry pop with luminous clarity. 

The aesthetic style is a refined blend of **Modern Corporate** and **Glassmorphism**. It utilizes semi-transparent surfaces, subtle inner glows that mimic light-pipe optics, and high-contrast accents to guide the user's focus through complex data sets without visual fatigue. The UI should evoke a sense of being in control of a precision machine—reliable, sleek, and futuristic.

## Colors
The palette is built on a high-contrast dark foundation. The primary background (#0B1220) provides deep negative space, while surfaces (#151D2E) use a slightly lighter navy to establish hierarchy through tonal layering.

- **Amber/Gold (#FBBF24):** Used for primary actions (CTAs), critical warnings, and logo marks. It represents "Cautionary Authority."
- **Cyan (#22D3EE):** Reserved for "Live" states, active GPS tracking, and system-online indicators. It provides a cool, technical contrast to the warm amber.
- **Triage (Semantic):** Red is used exclusively for destructive actions or critical failures. Green is reserved for positive telemetry and "Safe" status. Black (#1C2636) is used for tertiary containers or deep-set UI elements to provide additional contrast steps.

## Typography
The typography system uses a tri-font strategy to balance character and utility:

1.  **Sora (Headings):** Geometric and bold. Used for page titles and display metrics where visual impact is paramount.
2.  **DM Sans (Body):** Low contrast and highly legible. Used for all descriptive text, settings, and general interface labels.
3.  **JetBrains Mono (Data/Code):** Utilized for GHP packets, timestamps, coordinates, and technical telemetry. The monospaced nature ensures that fluctuating numerical values do not cause layout shifts.

All "Display" and "Headline" levels should use tighter letter spacing to maintain a "compact tech" feel. Data labels should be uppercase with increased tracking for maximum readability at small sizes.

## Layout & Spacing
The layout follows a **Fluid Grid** model based on an 8px rhythmic unit. This ensures consistent alignment across dashboard widgets and mobile views.

- **Desktop:** 12-column grid with 24px gutters. Use wide 40px margins to simulate the "floating" nature of a HUD centered in a windshield.
- **Tablet:** 8-column grid with 20px gutters and 24px margins.
- **Mobile:** 4-column grid with 16px gutters and 16px margins.

Spacing should prioritize "Stacking" for data lists (8px between items) and "Grouping" for distinct modules (32px between cards). Use generous padding within cards (24px) to prevent data density from becoming overwhelming.

## Elevation & Depth
Elevation is conveyed through **Tonal Layers** and **HUD-inspired illumination** rather than traditional shadows.

1.  **Level 0 (Background):** Deep Navy (#0B1220).
2.  **Level 1 (Default Surface):** Darker Navy (#151D2E). Use a 1px solid border of #1C2636 for definition.
3.  **Level 2 (Active/Floating):** Use a backdrop blur (12px) with a semi-transparent fill of the Surface color (80% opacity). Add a subtle "Cyan" or "Amber" outer glow (4px blur, 10% opacity) to indicate active status.

Avoid drop shadows. Instead, use "Inner Glows" (1px stroke, inside, low opacity white or accent color) to give elements a glass-like edge that catches light.

## Shapes
The shape language is controlled and precise. While the general system follows a "Rounded" philosophy, we apply specific radii to different component classes:

- **Cards & Modules:** 12px (0.75rem) corner radius. This provides a soft, modern container that feels premium.
- **Buttons & Inputs:** 8px (0.5rem) corner radius. This sharper radius communicates tactility and "clickable" precision.
- **Status Indicators/Chips:** Fully pill-shaped (999px) to distinguish them from interactive buttons.

Icons should follow a medium-stroke (2px) weight with slightly rounded terminals to match the Sora typeface.

## Components
Consistent component styling is vital for the HUD aesthetic:

- **Buttons:** 
  - *Primary:* Solid Amber (#FBBF24) with Black text. 8px radius.
  - *Secondary:* Ghost style with Cyan (#22D3EE) 1px border and text.
- **Cards:** Use #151D2E background. 12px radius. Header areas should be separated by a 1px divider in #1C2636.
- **Input Fields:** Darker background (#0B1220). On focus, the border transitions to Cyan with a faint outer glow.
- **Chips:** Small, pill-shaped. Background is a 10% tint of the status color (Cyan/Amber/Green) with 100% opacity text.
- **Lists:** Use JetBrains Mono for secondary metadata. Items are separated by subtle 1px lines (#1C2636).
- **Telemetry Gauges:** Use Cyan for current progress/status and Amber for warning thresholds. Circular gauges should have a subtle backdrop blur on the center "needle" or indicator.