import { tokens } from './tokens';

/**
 * Back-compat aliases used across older screens. Margi Care Path tokens map legacy
 * amber/cyan/mint slot names to royal blue / orange / green so legacy
 * imports keep compiling — every consumer either renders fine on the new theme or has been
 * migrated explicitly.
 */
export const colors = {
  bg: tokens.background,
  surface: tokens.surfaceContainerLow,
  surface2: tokens.surfaceContainer,
  border: tokens.outlineVariant,
  text: tokens.onSurface,
  muted: tokens.onSurfaceVariant,
  /** Legacy "amber" CTA → navy primary. */
  amber: tokens.primary,
  /** Legacy "cyan" highlight → saffron container. */
  cyan: tokens.secondary,
  /** Legacy "safe" mint → Indian green. */
  safe: tokens.tertiary,
  urgent: tokens.error,
  red: tokens.triage.red,
  yellow: tokens.triage.yellow,
  green: tokens.triage.green,
  black: tokens.triage.black,
};

export { tokens };
