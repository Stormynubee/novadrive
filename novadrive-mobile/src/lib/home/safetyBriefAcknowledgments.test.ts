import {
  parseBriefAcknowledgments,
  serializeBriefAcknowledgments,
} from './safetyBriefAcknowledgments';

describe('parseBriefAcknowledgments', () => {
  it('returns empty array for null or invalid json', () => {
    expect(parseBriefAcknowledgments(null)).toEqual([]);
    expect(parseBriefAcknowledgments('not-json')).toEqual([]);
    expect(parseBriefAcknowledgments('{}')).toEqual([]);
  });

  it('returns string slugs from json array', () => {
    expect(parseBriefAcknowledgments('["protocol-alpha","regional-alert"]')).toEqual([
      'protocol-alpha',
      'regional-alert',
    ]);
    expect(parseBriefAcknowledgments('["ok",42]')).toEqual(['ok']);
  });
});

describe('serializeBriefAcknowledgments', () => {
  it('round-trips slug list', () => {
    const raw = serializeBriefAcknowledgments(['regional-alert']);
    expect(parseBriefAcknowledgments(raw)).toEqual(['regional-alert']);
  });
});
