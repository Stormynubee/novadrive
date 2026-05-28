## v1.4.0 — Distress voice detection

### Highlights

- **Fewer false positives:** Navigation transitions, app TTS, and mic warm-up are suppressed before distress scoring runs.
- **Two-stage detection:** Loudness pre-filter plus spectral classifier with frame confirmation; optional on-device YAMNet in dev-client builds.
- **Naari + journey:** Voice monitor mounts whenever distress detection is allowed, not only during an active drive.
- **Profile control:** Distress voice sensitivity (low / medium / high) when Voice Crash Detection is enabled.

### Verification

- Mobile unit tests: **135** (`cd novadrive-mobile && npm test`)
- Device smoke rows **23–26** in `novadrive-mobile/docs/DEVICE_SMOKE_MATRIX.md`

### Expo Go vs dev client

Expo Go uses metering-derived feature proxies. Full YAMNet ONNX requires a development build — see `novadrive-mobile/scripts/export-yamnet-distress-onnx.md`.
