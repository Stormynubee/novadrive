import {
  allChecklistComplete,
  buildBriefShareMessage,
  getSafetyBriefDetail,
  resolveBriefQuickAction,
  toggleChecklistItem,
  toggleProtocolAcknowledgment,
} from './safetyBriefExperience';

describe('getSafetyBriefDetail', () => {
  it('returns protocol alpha with checklist and corridor actions', () => {
    const brief = getSafetyBriefDetail('protocol-alpha');
    expect(brief?.title).toBe('Safety Protocol Alpha');
    expect(brief?.severity).toBe('advisory');
    expect(brief?.checklist.length).toBeGreaterThanOrEqual(3);
    expect(brief?.quickActions.some((a) => a.id === 'plan-corridor')).toBe(true);
  });

  it('returns regional alert with active severity and affected corridors', () => {
    const brief = getSafetyBriefDetail('regional-alert');
    expect(brief?.severity).toBe('active');
    expect(brief?.affectedCorridors).toContain('NH-45 (GST Road)');
    expect(brief?.quickActions.some((a) => a.id === 'settings-regional')).toBe(true);
  });

  it('returns null for unknown slug', () => {
    expect(getSafetyBriefDetail('unknown')).toBeNull();
  });
});

describe('toggleChecklistItem', () => {
  it('adds and removes checklist completion ids', () => {
    expect(toggleChecklistItem([], 'rest')).toEqual(['rest']);
    expect(toggleChecklistItem(['rest'], 'rest')).toEqual([]);
    expect(toggleChecklistItem(['rest'], 'hazards')).toEqual(['rest', 'hazards']);
  });
});

describe('allChecklistComplete', () => {
  it('is true only when every checklist item is completed', () => {
    const brief = getSafetyBriefDetail('protocol-alpha');
    expect(brief).not.toBeNull();
    if (!brief) return;
    expect(allChecklistComplete([], brief.checklist)).toBe(false);
    const done = brief.checklist.map((c) => c.id);
    expect(allChecklistComplete(done, brief.checklist)).toBe(true);
  });
});

describe('toggleProtocolAcknowledgment', () => {
  it('tracks acknowledged protocol slugs', () => {
    expect(toggleProtocolAcknowledgment([], 'protocol-alpha')).toEqual(['protocol-alpha']);
    expect(toggleProtocolAcknowledgment(['protocol-alpha'], 'protocol-alpha')).toEqual([]);
  });
});

describe('resolveBriefQuickAction', () => {
  it('maps plan-corridor to trip tab and share to share handler', () => {
    expect(resolveBriefQuickAction('plan-corridor')).toEqual({
      type: 'href',
      href: '/(tabs)/drive',
    });
    expect(resolveBriefQuickAction('share')).toEqual({ type: 'share' });
  });
});

describe('buildBriefShareMessage', () => {
  it('includes title, region, and first paragraph', () => {
    const brief = getSafetyBriefDetail('regional-alert');
    expect(brief).not.toBeNull();
    if (!brief) return;
    const message = buildBriefShareMessage(brief);
    expect(message).toContain('Regional Alert');
    expect(message).toContain('NH-45');
  });
});
