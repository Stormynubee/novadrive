# Distress voice detection — implementation index

> Shipped on **`master`** as [`7370f90`](https://github.com/Stormynubee/novadrive/commit/7370f90). Release tag: **`v1.4.0-distress-voice`**.

**Goal:** Stop false “Distress signal detected” popups during navigation and ambient audio while still detecting real screams/yells during an active journey or Naari safety mode.

**Design spec (thresholds, classes, privacy):** [novadrive-mobile/docs/superpowers/specs/2026-05-28-distress-voice-detection-design.md](../../novadrive-mobile/docs/superpowers/specs/2026-05-28-distress-voice-detection-design.md)

## Key files

| Area | Path |
|------|------|
| Policy | `novadrive-mobile/src/lib/voice/distressVoicePolicy.ts` |
| Features | `novadrive-mobile/src/lib/voice/distressAudioFeatures.ts` |
| Classifier | `novadrive-mobile/src/lib/voice/distressVoiceClassifier.ts` |
| Fixtures | `novadrive-mobile/src/lib/__fixtures__/distressVoiceVectors.ts` |
| YAMNet (optional) | `novadrive-mobile/src/lib/voice/yamnetDistressInference.ts` |
| Wiring | `AppContext.tsx`, `SafetyMonitorBridge.tsx`, `JourneyVoiceMonitor.tsx` |

## Verification

```bash
cd novadrive-mobile
npm test -- src/lib/voice/
npm run verify:docs
npm run typecheck
```

Device smoke: [DEVICE_SMOKE_MATRIX.md](../../novadrive-mobile/docs/DEVICE_SMOKE_MATRIX.md) rows **23–26**.

## ONNX (dev client only)

See [novadrive-mobile/scripts/export-yamnet-distress-onnx.md](../../novadrive-mobile/scripts/export-yamnet-distress-onnx.md).
