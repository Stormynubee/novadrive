import { buildDistressSmsBody, buildLocationShareBody } from './messages';

describe('buildDistressSmsBody', () => {
  it('includes maps link and user name', () => {
    const body = buildDistressSmsBody({
      userName: 'Priya S.',
      lat: 28.61,
      lng: 77.21,
      stationName: 'Civil Lines Police HQ',
    });
    expect(body).toContain('NAARI SHAKTI');
    expect(body).toContain('Priya');
    expect(body).toMatch(/maps|28\.61/);
  });
});

describe('buildLocationShareBody', () => {
  it('includes coordinates', () => {
    const body = buildLocationShareBody({ userName: 'Priya', lat: 1, lng: 2 });
    expect(body).toContain('1.00000');
    expect(body).toContain('maps.google.com');
  });
});
