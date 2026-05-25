import { tokens } from './tokens';

/**
 * Typography — Hanken Grotesk for headlines (engineered, sharp), Public Sans for body/UI labels
 * (government-clarity). Mirrors `nova_drive_design_system/DESIGN.md`.
 *
 * `mono` and `monoData` keys are kept for back-compat with legacy `<HudText variant="mono" />`
 * call-sites — they now use Public Sans 700 with letter spacing instead of JetBrains Mono.
 */
export const typography = {
  display: {
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 44,
    lineHeight: 52,
    letterSpacing: -0.5,
    color: tokens.onSurface,
  },
  headlineLg: {
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.2,
    color: tokens.onSurface,
  },
  headlineMd: {
    fontFamily: 'HankenGrotesk_600SemiBold',
    fontSize: 22,
    lineHeight: 30,
    color: tokens.onSurface,
  },
  bodyLg: {
    fontFamily: 'PublicSans_400Regular',
    fontSize: 18,
    lineHeight: 28,
    color: tokens.onSurface,
  },
  bodyMd: {
    fontFamily: 'PublicSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: tokens.onSurface,
  },
  bodySm: {
    fontFamily: 'PublicSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: tokens.onSurfaceVariant,
  },
  /** Persistent input/section labels — DESIGN.md `label-bold` */
  dataLabel: {
    fontFamily: 'PublicSans_700Bold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: tokens.onSurfaceVariant,
  },
  /** Numbers / coords / km counters — Public Sans 700 (tabular numerals) */
  dataValue: {
    fontFamily: 'PublicSans_700Bold',
    fontSize: 16,
    lineHeight: 22,
    color: tokens.onSurface,
  },
};
