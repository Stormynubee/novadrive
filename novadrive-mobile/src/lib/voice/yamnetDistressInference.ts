import { scoreDistressFromYamnetLabels, type YamnetLabelScore } from './yamnetDistressLabels';

export type YamnetDistressScore = {
  distress: number;
  topClass: string;
  suppressed: boolean;
};

/** Pure scoring for unit tests and ONNX output mapping. */
export function scoreDistressFromYamnetLogits(
  labelScores: YamnetLabelScore[]
): YamnetDistressScore {
  return scoreDistressFromYamnetLabels(labelScores);
}

let runtimeAvailable: boolean | null = null;

/** Returns null when ONNX runtime or model is unavailable (Expo Go, tests). */
export async function runYamnetDistress(
  _pcm16k: Float32Array
): Promise<YamnetDistressScore | null> {
  if (runtimeAvailable === false) return null;
  try {
    // Optional: onnxruntime-react-native + bundled model (dev client only).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ort = require('onnxruntime-react-native') as {
      InferenceSession: { create: (path: string) => Promise<unknown> };
    };
    if (!ort?.InferenceSession) {
      runtimeAvailable = false;
      return null;
    }
    runtimeAvailable = true;
    return null;
  } catch {
    runtimeAvailable = false;
    return null;
  }
}
