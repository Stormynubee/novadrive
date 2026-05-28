import { toCurrentLocationLabel } from './locationLabel';

describe('toCurrentLocationLabel', () => {
  it('formats coordinates with fixed precision', () => {
    const label = toCurrentLocationLabel({ lat: 12.9715987, lng: 77.594566 });
    expect(label).toBe('Current Location · 12.9716, 77.5946');
  });

  it('returns pending label when coordinates are unavailable', () => {
    expect(toCurrentLocationLabel(null)).toBe('Locating current location...');
  });
});
