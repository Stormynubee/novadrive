import { resolveBriefHighlightDisplay } from './briefHighlightDisplay';

describe('resolveBriefHighlightDisplay', () => {
  it('uppercases the label and keeps the full value by default', () => {
    expect(resolveBriefHighlightDisplay({ label: 'Rest rule', value: '4 h / 250 km' })).toEqual({
      label: 'REST RULE',
      value: '4 h / 250 km',
    });
  });

  it('prefers compact copy for narrow stat rows when provided', () => {
    expect(
      resolveBriefHighlightDisplay({
        label: 'Compliance',
        value: 'Emergency lane',
        compactLabel: 'Lanes',
        compactValue: 'Emergency only',
      }),
    ).toEqual({
      label: 'LANES',
      value: 'Emergency only',
    });
  });
});
