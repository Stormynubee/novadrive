/**
 * Margi — Care Path design tokens (logo: heart, path, vitality).
 *
 * Deep navy brand chrome (NovaDrive-era); saffron for urgent action; green for safe.
 */
export const tokens = {
  // ── surfaces ───────────────────────────────────────────────────────────
  background: '#f8f9fb',
  surface: '#ffffff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f5f8',
  surfaceContainer: '#e8ecf2',
  surfaceContainerHigh: '#dde3eb',
  surfaceContainerHighest: '#d1d9e4',
  surfaceDim: '#c8d0dc',
  inverseSurface: '#191c1d',
  inverseOnSurface: '#f0f4f8',

  // ── ink ────────────────────────────────────────────────────────────────
  onSurface: '#191c1d',
  onSurfaceVariant: '#44474e',
  outline: '#6b7280',
  outlineVariant: '#c5cdd8',
  innerHighlight: 'rgba(0,10,30,0.06)',

  // ── primary (Deep Navy: brand + primary CTAs) ──────────────────────────
  primary: '#000a1e',
  onPrimary: '#ffffff',
  primaryDeep: '#000714',
  primaryContainer: '#e8edf5',
  onPrimaryContainer: '#000714',
  primaryFixed: '#b3c5d9',
  primaryFixedDim: '#7a94b0',
  inversePrimary: '#7a94b0',

  // ── secondary (Emergency Saffron: urgent action + active state) ────────
  secondary: '#fe6b00',
  onSecondary: '#ffffff',
  secondaryContainer: '#ffe8cc',
  onSecondaryContainer: '#5c3d00',
  secondaryDeep: '#a04100',
  secondaryFixed: '#ffd9a8',
  secondaryFixedDim: '#ffb84d',

  // ── tertiary (Safe Green: verified status) ─────────────────────────────
  tertiary: '#249c53',
  onTertiary: '#ffffff',
  tertiaryContainer: '#b8f0c8',
  onTertiaryContainer: '#00210b',
  tertiaryFixedDim: '#6cdd8c',

  // ── error (critical alerts, not CTAs) ──────────────────────────────────
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // ── triage colors (MARS START) ─────────────────────────────────────────
  triage: {
    red: '#ba1a1a',
    yellow: '#fe6b00',
    green: '#249c53',
    black: '#44474e',
  },

  // ── shape & spacing ────────────────────────────────────────────────────
  radius: {
    button: 8,
    card: 12,
    input: 6,
    chip: 999,
    sheet: 24,
    iconWrap: 12,
  },
  spacing: { base: 8, gutter: 16, sideMargin: 24, stackSm: 8, stackMd: 16, stackLg: 32 },

  // ── elevation ──────────────────────────────────────────────────────────
  elevation: {
    card: {
      shadowColor: '#000a1e',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    floating: {
      shadowColor: '#000a1e',
      shadowOpacity: 0.1,
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
