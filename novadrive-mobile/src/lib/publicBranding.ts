/** Patterns forbidden in GitHub-facing / public copy (not legacy sections). */
export const FORBIDDEN_BRAND_PATTERNS = [
  /\bNovaDrive\b/,
  /NOVA DRIVE/,
  /\bNOVADRIVE\b/,
] as const;

/** Team credit on banners/README — product name remains Margi. */
export const ALLOWED_TEAM_NOVADRIVE = /Team NovaDrive/gi;

export function scrubAllowedPublicBranding(body: string): string {
  return body.replace(ALLOWED_TEAM_NOVADRIVE, 'Team __ALLOWED__');
}

export function allowsLegacyBrandingSection(body: string): boolean {
  const legacyIdx = body.search(/legacy compatibility/i);
  if (legacyIdx === -1) return false;
  const beforeLegacy = scrubAllowedPublicBranding(body.slice(0, legacyIdx));
  return !FORBIDDEN_BRAND_PATTERNS.some((re) => re.test(beforeLegacy));
}

export function findPublicBrandingViolation(
  body: string,
): { pattern: string; match: string } | null {
  if (allowsLegacyBrandingSection(body)) return null;
  const scrubbed = scrubAllowedPublicBranding(body);
  for (const re of FORBIDDEN_BRAND_PATTERNS) {
    const m = scrubbed.match(re);
    if (m) return { pattern: re.source, match: m[0] };
  }
  return null;
}
