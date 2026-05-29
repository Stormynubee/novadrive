import { findPublicBrandingViolation } from './publicBranding';

describe('publicBranding', () => {
  it('flags NovaDrive in public copy', () => {
    expect(findPublicBrandingViolation('Welcome to NovaDrive app')).toEqual({
      pattern: '\\bNovaDrive\\b',
      match: 'NovaDrive',
    });
  });

  it('allows legacy section after heading', () => {
    const body = `# Margi\n\n## Legacy compatibility\n\nNOVADRIVE GHP is still parsed.\n`;
    expect(findPublicBrandingViolation(body)).toBeNull();
  });
});
