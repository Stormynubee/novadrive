import { fetchCurrentWeather, weatherSummaryForCode } from './weather';

describe('weatherSummaryForCode', () => {
  it('maps clear sky', () => {
    expect(weatherSummaryForCode(0)).toMatch(/clear/i);
  });
});

describe('fetchCurrentWeather', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns rounded Celsius and summary', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ current: { temperature_2m: 31.6, weather_code: 0 } }),
    } as Response);

    const w = await fetchCurrentWeather(13.08, 80.27);
    expect(w.tempC).toBe(32);
    expect(w.summary).toBeTruthy();
    expect(w.weatherCode).toBe(0);
  });

  it('throws when API fails', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false } as Response);
    await expect(fetchCurrentWeather(13.08, 80.27)).rejects.toThrow();
  });
});
