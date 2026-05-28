# Export YAMNet distress ONNX (one-time)

## 1. Download base YAMNet ONNX

```bash
# Example: jafet21/yamnetonnx on Hugging Face
# Input: float32[1, 16000] mono @ 16 kHz
# Output: 521 AudioSet class logits
```

Place the file at:

`assets/models/yamnet_distress_mini.onnx`

## 2. Optional calibration head

Train a small fusion layer offline on ESC-50 / AudioSet scream clips, or keep rule-based fusion in `scoreDistressFromYamnetLogits` (see `yamnetDistressLabels.ts`).

## 3. Install native runtime (dev client only)

```bash
cd novadrive-mobile
npx expo install onnxruntime-react-native
npx expo prebuild
npx expo run:android
```

Expo Go does **not** load ONNX. Use a development build.

## 4. Wire inference

Implement session load in `src/lib/voice/yamnetDistressInference.ts` `runYamnetDistress()` using `InferenceSession.create` and the bundled asset via `expo-asset`.
