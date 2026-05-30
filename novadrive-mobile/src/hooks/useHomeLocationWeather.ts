import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import { reverseGeocodePlace } from '../lib/geocode';
import { fetchCurrentWeather } from '../lib/home/weather';

export type HomeLocationWeatherState = {
  cityLabel: string;
  regionLabel: string;
  lat: number | null;
  lng: number | null;
  tempC: number | null;
  summary: string;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  refresh: () => Promise<void>;
};

const DENIED_SUMMARY =
  'Enable location in device settings to receive local weather and corridor briefings for your area.';

export function useHomeLocationWeather(): HomeLocationWeatherState {
  const [cityLabel, setCityLabel] = useState('Locating…');
  const [regionLabel, setRegionLabel] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [tempC, setTempC] = useState<number | null>(null);
  const [summary, setSummary] = useState('Fetching weather for your corridor…');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setCityLabel('Location unavailable');
        setRegionLabel('');
        setLat(null);
        setLng(null);
        setTempC(null);
        setSummary(DENIED_SUMMARY);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;
      setLat(latitude);
      setLng(longitude);
      const place = await reverseGeocodePlace(latitude, longitude);
      const city = place.city ?? place.district ?? 'Your location';
      const region = place.region ?? (place.district && place.district !== city ? place.district : '');

      setCityLabel(city);
      setRegionLabel(region);

      try {
        const weather = await fetchCurrentWeather(latitude, longitude);
        setTempC(weather.tempC);
        setSummary(weather.summary);
      } catch {
        setTempC(null);
        setSummary('Weather unavailable — corridor briefing still active.');
        setError('Weather service unavailable');
      }
    } catch (e) {
      setCityLabel('Location unavailable');
      setRegionLabel('');
      setLat(null);
      setLng(null);
      setTempC(null);
      setSummary(DENIED_SUMMARY);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    cityLabel,
    regionLabel,
    lat,
    lng,
    tempC,
    summary,
    loading,
    error,
    permissionDenied,
    refresh,
  };
}
