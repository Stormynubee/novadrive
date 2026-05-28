import { pickDispatchLocation } from './dispatchLocation';

describe('pickDispatchLocation', () => {
  it('prefers freshly acquired coordinates over stale session coordinates', () => {
    const location = pickDispatchLocation(
      { lat: 12.9, lng: 77.5 },
      { lat: 13.02, lng: 77.62 }
    );

    expect(location).toEqual({ lat: 13.02, lng: 77.62 });
  });

  it('falls back to session coordinates when fresh coordinates are unavailable', () => {
    const location = pickDispatchLocation({ lat: 12.9, lng: 77.5 }, null);
    expect(location).toEqual({ lat: 12.9, lng: 77.5 });
  });

  it('returns null when no usable coordinates exist', () => {
    const location = pickDispatchLocation(undefined, null);
    expect(location).toBeNull();
  });
});
