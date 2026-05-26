import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  type AudioRecorder,
} from 'expo-audio';

const EMERGENCY_OPTIONS = {
  ...RecordingPresets.LOW_QUALITY,
  isMeteringEnabled: false,
};

export async function prepareEmergencyRecording(recorder: AudioRecorder): Promise<boolean> {
  const { granted } = await requestRecordingPermissionsAsync();
  if (!granted) return false;

  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
  });

  const st = recorder.getStatus();
  if (!st.canRecord) {
    await recorder.prepareToRecordAsync(EMERGENCY_OPTIONS);
  }
  return true;
}

export async function startEmergencyRecording(recorder: AudioRecorder): Promise<boolean> {
  const ready = await prepareEmergencyRecording(recorder);
  if (!ready) return false;
  const st = recorder.getStatus();
  if (st.isRecording) return true;
  recorder.record();
  return true;
}

export async function stopEmergencyRecording(recorder: AudioRecorder): Promise<string | null> {
  try {
    const st = recorder.getStatus();
    if (!st.isRecording) return null;
    await recorder.stop();
    const uri = recorder.uri;
    return uri ?? null;
  } catch {
    return null;
  }
}

export { EMERGENCY_OPTIONS };
