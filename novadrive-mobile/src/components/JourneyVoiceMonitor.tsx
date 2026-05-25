import { useEffect, useRef } from 'react';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useApp } from '../context/AppContext';

const VOICE_OPTIONS = {
  ...RecordingPresets.LOW_QUALITY,
  isMeteringEnabled: true,
};

/** Single recorder instance for journey — uses expo-audio (replaces deprecated expo-av). */
export function JourneyVoiceMonitor({ active }: { active: boolean }) {
  const { processVoiceMeterSample, setVoiceMonitoringActive } = useApp();
  const activeRef = useRef(active);
  const startingRef = useRef(false);

  activeRef.current = active;

  const recorder = useAudioRecorder(VOICE_OPTIONS);
  const state = useAudioRecorderState(recorder, 100);

  useEffect(() => {
    if (
      !active ||
      !state.isRecording ||
      state.metering == null ||
      !Number.isFinite(state.metering)
    ) {
      return;
    }
    processVoiceMeterSample(state.metering);
  }, [active, state.isRecording, state.metering, processVoiceMeterSample]);

  useEffect(() => {
    if (!active) {
      startingRef.current = false;
      (async () => {
        try {
          if (recorder.getStatus().isRecording) {
            await recorder.stop();
          }
        } catch {
          /* already stopped */
        }
        setVoiceMonitoringActive(false);
      })();
      return;
    }

    let cancelled = false;

    (async () => {
      if (startingRef.current) return;
      startingRef.current = true;
      try {
        const { granted } = await requestRecordingPermissionsAsync();
        if (cancelled || !activeRef.current || !granted) {
          setVoiceMonitoringActive(false);
          return;
        }

        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });

        const st = recorder.getStatus();
        if (st.isRecording) {
          setVoiceMonitoringActive(true);
          return;
        }

        if (!st.canRecord) {
          await recorder.prepareToRecordAsync(VOICE_OPTIONS);
        }

        if (cancelled || !activeRef.current) return;

        recorder.record();
        setVoiceMonitoringActive(true);
      } catch {
        setVoiceMonitoringActive(false);
      } finally {
        startingRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [active, recorder, setVoiceMonitoringActive]);

  useEffect(() => {
    return () => {
      (async () => {
        try {
          if (recorder.getStatus().isRecording) {
            await recorder.stop();
          }
        } catch {
          /* already stopped */
        }
        setVoiceMonitoringActive(false);
      })();
    };
  }, [recorder, setVoiceMonitoringActive]);

  return null;
}
