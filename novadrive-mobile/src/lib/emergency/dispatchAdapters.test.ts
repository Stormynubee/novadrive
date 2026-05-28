import { createDispatchAdapters } from './dispatchAdapters';

describe('dispatchAdapters', () => {
  it('returns normalized trauma and police dispatch payload', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          center: { name: 'AIIMS Delhi', phone: '+91-11-26588500', etaMinutes: 6 },
          referenceId: 'TR-001',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          unit: { name: 'Delhi Police PCR', phone: '112', etaMinutes: 4 },
          referenceId: 'PL-901',
        }),
      });

    const adapters = createDispatchAdapters({
      traumaEndpoint: 'https://example.org/trauma',
      policeEndpoint: 'https://example.org/police',
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    const result = await adapters.requestDispatch({
      incidentType: 'road_accident',
      lat: 28.6139,
      lng: 77.209,
      language: 'en',
    });

    expect(result.traumaCenter.name).toBe('AIIMS Delhi');
    expect(result.policeUnit.name).toBe('Delhi Police PCR');
    expect(result.status).toBe('dispatched');
    expect(result.referenceId).toBeTruthy();
  });

  it('falls back gracefully when one provider fails', async () => {
    const fetchMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('trauma unavailable'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          unit: { name: 'Delhi Police PCR', phone: '112', etaMinutes: 4 },
          referenceId: 'PL-901',
        }),
      });

    const adapters = createDispatchAdapters({
      traumaEndpoint: 'https://example.org/trauma',
      policeEndpoint: 'https://example.org/police',
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    const result = await adapters.requestDispatch({
      incidentType: 'human_crime',
      lat: 28.6139,
      lng: 77.209,
      language: 'hi',
    });

    expect(result.status).toBe('partial');
    expect(result.policeUnit.name).toBe('Delhi Police PCR');
    expect(result.traumaCenter.name).toBe('Awaiting dispatch confirmation');
    expect(result.traumaCenter.etaMinutes).toBeNull();
  });

  it('treats missing ETA as pending instead of zero-minute ready state', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          center: { name: 'City Trauma Hub', phone: '108' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          unit: { name: 'City PCR', phone: '112' },
        }),
      });

    const adapters = createDispatchAdapters({
      traumaEndpoint: 'https://example.org/trauma',
      policeEndpoint: 'https://example.org/police',
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    const result = await adapters.requestDispatch({
      incidentType: 'road_accident',
      lat: 28.6139,
      lng: 77.209,
      language: 'en',
    });

    expect(result.traumaCenter.etaMinutes).toBeNull();
    expect(result.policeUnit.etaMinutes).toBeNull();
    expect(result.status).toBe('dispatched');
  });
});
