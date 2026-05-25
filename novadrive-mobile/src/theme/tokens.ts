/**
 * NovaDrive — GovTech design tokens (Stitch nova_drive_design_system/DESIGN.md).
 *
 * Light, institutional, navy-forward. Saffron is reserved for urgent action; green for "safe".
 * Old amber/cyan slot keys (`primary`, `secondary`, `tertiary`) are preserved so the rest of the
 * app keeps compiling, but the values now point at the new GovTech palette.
 */
export const tokens = {
  // ── surfaces ───────────────────────────────────────────────────────────
  background: '#f8f9fa',
  surface: '#ffffff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f4f5',
  surfaceContainer: '#edeeef',
  surfaceContainerHigh: '#e7e8e9',
  surfaceContainerHighest: '#e1e3e4',
  surfaceDim: '#d9dadb',
  inverseSurface: '#2e3132',
  inverseOnSurface: '#f0f1f2',

  // ── ink ────────────────────────────────────────────────────────────────
  onSurface: '#191c1d',
  onSurfaceVariant: '#44474e',
  outline: '#74777f',
  outlineVariant: '#c4c6cf',
  innerHighlight: 'rgba(0,10,30,0.06)',

  // ── primary (Deep Navy: brand chrome + primary CTAs) ───────────────────
  primary: '#000a1e',
  onPrimary: '#ffffff',
  primaryContainer: '#002147',
  onPrimaryContainer: '#708ab5',
  primaryFixed: '#d6e3ff',
  primaryFixedDim: '#aec7f6',
  inversePrimary: '#aec7f6',

  // ── secondary (Emergency Saffron: urgent action + active state) ────────
  secondary: '#fe6b00',
  onSecondary: '#ffffff',
  secondaryContainer: '#fe6b00',
  onSecondaryContainer: '#572000',
  secondaryDeep: '#a04100',
  secondaryFixed: '#ffdbcc',
  secondaryFixedDim: '#ffb693',

  // ── tertiary (Indian Green: safe / verified status) ────────────────────
  tertiary: '#249c53',
  onTertiary: '#ffffff',
  tertiaryContainer: '#89faa5',
  onTertiaryContainer: '#00210b',
  tertiaryFixedDim: '#6cdd8c',

  // ── error (critical alerts, not CTAs) ──────────────────────────────────
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // ── triage colors (carry over from MARS START) ─────────────────────────
  triage: {
    red: '#ba1a1a',
    yellow: '#fe6b00',
    green: '#249c53',
    black: '#44474e',
  },

  // ── shape & spacing (Soft Level 1: 4–12px) ─────────────────────────────
  radius: {
    button: 8,
    card: 12,
    input: 6,
    chip: 999,
    sheet: 24,
    iconWrap: 12,
  },
  spacing: { base: 8, gutter: 16, sideMargin: 24, stackSm: 8, stackMd: 16, stackLg: 32 },

  // ── elevation (subtle gradients, not heavy shadows) ────────────────────
  elevation: {
    card: {
      shadowColor: '#000a1e',
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    floating: {
      shadowColor: '#000a1e',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    sos: {
      shadowColor: '#fe6b00',
      shadowOpacity: 0.45,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 6 },
      elevation: 12,
    },
  },
} as const;
