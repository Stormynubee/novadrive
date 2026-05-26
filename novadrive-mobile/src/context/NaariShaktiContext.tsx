import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { Alert } from 'react-native';
import { useAudioRecorder } from 'expo-audio';
import { useApp } from './AppContext';
import { speakA11y } from '../lib/a11yRuntime';
import { activateNaariDistress } from '../lib/naariShakti/engine';
import { EMERGENCY_OPTIONS, startEmergencyRecording, stopEmergencyRecording } from '../lib/naariShakti/emergencyRecorder';
import { openSmsUrl, shareLiveLocation } from '../lib/naariShakti/linkingActions';
import type { NaariDistressCoords } from '../lib/naariShakti/engine';

type NaariShaktiContextValue = {
  distressActive: boolean;
  lastCoords: NaariDistressCoords | null;
  recordingUri: string | null;
  enablePortal: () => Promise<void>;
  dismissProtocol: () => Promise<void>;
  setSafetyMode: (active: boolean) => Promise<void>;
  activateDistress: () => Promise<void>;
  cancelDistress: () => Promise<void>;
  getCurrentCoords: () => Promise<NaariDistressCoords | null>;
};

const NaariShaktiContext = createContext<NaariShaktiContextValue | null>(null);

export function NaariShaktiProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile, a11y } = useApp();
  const recorder = useAudioRecorder(EMERGENCY_OPTIONS);
  const activatingRef = useRef(false);
  const [distressActive, setDistressActive] = useState(false);
  const [lastCoords, setLastCoords] = useState<NaariDistressCoords | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  const enablePortal = useCallback(async () => {
    await updateProfile({
      naariShakti: {
        enabled: true,
        safetyModeActive: true,
        protocolDismissedAt: profile.naariShakti?.protocolDismissedAt,
      },
    });
  }, [profile.naariShakti?.protocolDismissedAt, updateProfile]);

  const dismissProtocol = useCallback(async () => {
    await updateProfile({
      naariShakti: {
        enabled: false,
        safetyModeActive: profile.naariShakti?.safetyModeActive ?? false,
        protocolDismissedAt: new Date().toISOString(),
      },
    });
  }, [profile.naariShakti?.safetyModeActive, updateProfile]);

  const setSafetyMode = useCallback(
    async (active: boolean) => {
      await updateProfile({
        naariShakti: {
          enabled: profile.naariShakti?.enabled ?? false,
          safetyModeActive: active,
          protocolDismissedAt: profile.naariShakti?.protocolDismissedAt,
        },
      });
    },
    [profile.naariShakti, updateProfile]
  );

  const getCurrentCoords = useCallback(async (): Promise<NaariDistressCoords | null> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location required',
        'Enable location to share your position during Naari Shakti emergencies.'
      );
      return null;
    }
    try {
      const last = await Location.getLastKnownPositionAsync({ maxAge: 120_000 });
      if (last?.coords) {
        return { lat: last.coords.latitude, lng: last.coords.longitude };
      }
    } catch {
      /* fall through to fresh fix */
    }
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  }, []);

  useEffect(() => {
    void getCurrentCoords().then((coords) => {
      if (coords) setLastCoords(coords);
    });
  }, [getCurrentCoords]);

  const cancelDistress = useCallback(async () => {
    const uri = await stopEmergencyRecording(recorder);
    if (uri) setRecordingUri(uri);
    setDistressActive(false);
    activatingRef.current = false;
    Speech.stop();
  }, [recorder]);

  const activateDistress = useCallback(async () => {
    const cachedCoords = lastCoords;

    if (activatingRef.current || distressActive) {
      return;
    }
    if (!profile.naariShakti?.safetyModeActive) {
      Alert.alert('Safety mode off', 'Turn on Safety Mode to use emergency help.');
      return;
    }

    activatingRef.current = true;
    setDistressActive(true);

    const runDistress = (coords: NaariDistressCoords) => {
      setLastCoords(coords);
      activateNaariDistress(
        { profile, coords },
        {
          speak: (message) => {
            Speech.speak(message, { volume: 1, rate: 0.95 });
            if (a11y.ttsEnabled) {
              speakA11y(message, a11y);
            }
          },
          openSms: (phone, body) => {
            openSmsUrl(phone, body).catch(() => undefined);
          },
          startRecording: () => {
            void startEmergencyRecording(recorder).then((ok) => {
              if (!ok) {
                Alert.alert(
                  'Microphone',
                  'Could not start emergency recording. SMS and location alerts will still be sent.'
                );
              }
            });
          },
        }
      );
      void shareLiveLocation(profile, coords);
      activatingRef.current = false;
    };

    if (cachedCoords) {
      runDistress(cachedCoords);
      return;
    }

    const coords = await getCurrentCoords();
    if (!coords) {
      setDistressActive(false);
      activatingRef.current = false;
      return;
    }
    runDistress(coords);
  }, [a11y, distressActive, getCurrentCoords, lastCoords, profile, recorder]);

  const value = useMemo(
    () => ({
      distressActive,
      lastCoords,
      recordingUri,
      enablePortal,
      dismissProtocol,
      setSafetyMode,
      activateDistress,
      cancelDistress,
      getCurrentCoords,
    }),
    [
      distressActive,
      lastCoords,
      recordingUri,
      enablePortal,
      dismissProtocol,
      setSafetyMode,
      activateDistress,
      cancelDistress,
      getCurrentCoords,
    ]
  );

  return (
    <NaariShaktiContext.Provider value={value}>{children}</NaariShaktiContext.Provider>
  );
}

export function useNaariShakti() {
  const ctx = useContext(NaariShaktiContext);
  if (!ctx) throw new Error('useNaariShakti must be used within NaariShaktiProvider');
  return ctx;
}
