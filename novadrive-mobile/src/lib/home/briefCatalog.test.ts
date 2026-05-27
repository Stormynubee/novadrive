import { getBriefBySlug } from './briefCatalog';

describe('getBriefBySlug', () => {
  it('returns protocol-alpha brief', () => {
    const brief = getBriefBySlug('protocol-alpha');
    expect(brief).not.toBeNull();
    expect(brief?.title).toBe('Safety Protocol Alpha');
    expect(brief?.paragraphs.length).toBeGreaterThan(0);
  });

  it('returns regional-alert brief', () => {
    const brief = getBriefBySlug('regional-alert');
    expect(brief?.title).toBe('Regional Alert');
  });

  it('returns null for unknown slug', () => {
    expect(getBriefBySlug('unknown')).toBeNull();
  });
});
