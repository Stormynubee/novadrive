export type HomeWeather = {
  tempC: number;
  weatherCode: number;
  summary: string;
};

/** WMO weather code → short driving copy for India corridors. */
export function weatherSummaryForCode(code: number): string {
  if (code === 0) {
    return 'Clear visibility. Monitor speed and following distance on highway stretches.';
  }
  if (code >= 1 && code <= 3) {
    return 'Partly cloudy. Good visibility; watch for sudden glare at dawn and dusk.';
  }
  if (code >= 45 && code <= 48) {
    return 'Fog or haze reported. Use low beams and reduce speed in low-visibility zones.';
  }
  if (code >= 51 && code <= 67) {
    return 'Rain in the area. Extend following distance and avoid sudden braking.';
  }
  if (code >= 71 && code <= 77) {
    return 'Snow or ice possible at elevation. Verify corridor conditions before departure.';
  }
  if (code >= 80 && code <= 99) {
    return 'Storms or heavy showers possible. Consider delaying non-essential travel.';
  }
  return 'Weather conditions vary. Stay alert and follow regional advisories.';
}

export async function fetchCurrentWeather(lat: number, lng: number): Promise<HomeWeather> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    '&current=temperature_2m,weather_code';

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Weather service unavailable');
  }

  const data = (await res.json()) as {
    current?: { temperature_2m?: number; weather_code?: number };
  };

  const temp = data.current?.temperature_2m ?? 0;
  const code = data.current?.weather_code ?? -1;

  return {
    tempC: Math.round(temp),
    weatherCode: code,
    summary: weatherSummaryForCode(code),
  };
}
