# Distress voice detection (2026-05-28)

## Goal

Detect real screams/yells during an active journey or Naari safety mode without false “Distress signal detected” modals from navigation, TTS, notifications, or conversation.

## Pipeline

1. **Lifecycle policy** (`distressVoicePolicy.ts`) — block samples during navigation transitions (4s), app TTS (+1.5s pad), recorder warm-up (6s).
2. **Metering pre-filter** (`panicVoiceEngine.ts`) — loudness/baseline gate only; not the final decision.
3. **Spectral features** (`distressAudioFeatures.ts`) — Goertzel bands 0–500 Hz, 500–2 kHz, 2–6 kHz; ZCR; crest factor. When `expo-audio` does not expose PCM (SDK 54), use `estimateMeteringProxies()` from dB.
4. **Classifier** (`distressVoiceClassifier.ts`) — spectral + optional YAMNet score; 3-of-5 frame confirmation; 45s cooldown.
5. **YAMNet ONNX** (`yamnetDistressInference.ts`) — optional dev-client head; input `float32[1,16000]` @ 16 kHz mono.

## YAMNet / AudioSet classes

| Bucket | Labels (examples) |
|--------|-------------------|
| Distress (high recall) | Scream, Screaming, Yell, Shout, Crying/sobbing |
| Ignore (down-rank) | Speech, Conversation, Music, Telephone bell, Beep, Clicking, Vehicle horn |

Thresholds: distress aggregate ≥ 0.45 (medium); spectral `highBandRatio` ≥ 0.6 and `zcr` ≥ 0.3.

## Sensitivity

| Setting | Confirm frames |
|---------|----------------|
| low | 4 |
| medium | 3 |
| high | 2 |

## Privacy

All on-device. No audio upload. Optional `__DEV__` WAV capture only if explicitly enabled later.

## PCM capture (SDK 54)

`expo-audio` `useAudioRecorder` provides **metering only**, not raw PCM. P0 uses metering-derived feature proxies. For full YAMNet, bundle ONNX + dev client; add native PCM tap (`react-native-audio-api` or custom module) in a follow-up.

## Smoke cases

See `docs/DEVICE_SMOKE_MATRIX.md` rows 23–26.
