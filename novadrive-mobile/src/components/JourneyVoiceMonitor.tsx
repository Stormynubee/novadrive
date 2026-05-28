import { useEffect, useRef } from 'react';
import { VoicePcmRingBuffer } from '../lib/voice/voicePcmRingBuffer';
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

/** Debounce brief `active` flicker (tab focus) so the recorder is not torn down immediately. */
const INACTIVE_STOP_DEBOUNCE_MS = 450;
/** Throttle optional YAMNet runs when PCM windows become available. */
const YAMNET_INTERVAL_MS = 500;

/**
 * Single recorder instance for journey — uses expo-audio (replaces deprecated expo-av).
 * SDK 54 recorder exposes metering only; PCM ring is ready for a future native tap.
 */
export function JourneyVoiceMonitor({ active }: { active: boolean }) {
  const { processVoiceMeterSample, setVoiceMonitoringActive, markRecorderWarmup } = useApp();
  const activeRef = useRef(active);
  const startingRef = useRef(false);
  const wasRecordingRef = useRef(false);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pcmRingRef = useRef(new VoicePcmRingBuffer());
  const lastYamnetAtRef = useRef(0);

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
    const pcmWindow =
      pcmRingRef.current.isFull ? pcmRingRef.current.snapshot() : undefined;
    processVoiceMeterSample(state.metering, pcmWindow);
    const now = Date.now();
    if (pcmWindow && now - lastYamnetAtRef.current >= YAMNET_INTERVAL_MS) {
      lastYamnetAtRef.current = now;
    }
  }, [active, state.isRecording, state.metering, processVoiceMeterSample]);

  useEffect(() => {
    if (!active) {
      if (!wasRecordingRef.current) return;
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      stopTimerRef.current = setTimeout(() => {
        stopTimerRef.current = null;
        if (activeRef.current) return;
        startingRef.current = false;
        (async () => {
          try {
            if (recorder.getStatus().isRecording) {
              await recorder.stop();
            }
          } catch {
            /* already stopped */
          }
          wasRecordingRef.current = false;
          pcmRingRef.current.clear();
          setVoiceMonitoringActive(false);
        })();
      }, INACTIVE_STOP_DEBOUNCE_MS);
      return () => {
        if (stopTimerRef.current) {
          clearTimeout(stopTimerRef.current);
          stopTimerRef.current = null;
        }
      };
    }

    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
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
          wasRecordingRef.current = true;
          return;
        }

        if (!st.canRecord) {
          await recorder.prepareToRecordAsync(VOICE_OPTIONS);
        }

        if (cancelled || !activeRef.current) return;

        recorder.record();
        markRecorderWarmup();
        wasRecordingRef.current = true;
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
  }, [active, recorder, setVoiceMonitoringActive, markRecorderWarmup]);

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
        wasRecordingRef.current = false;
        setVoiceMonitoringActive(false);
      })();
    };
  }, [recorder, setVoiceMonitoringActive]);

  return null;
}
