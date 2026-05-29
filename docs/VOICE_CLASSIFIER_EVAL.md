# Distress voice classifier — evaluation plan

Current build: **experimental**. Do not claim production accuracy.

## Pipeline

1. Loudness pre-filter (`panicVoiceEngine`)
2. Spectral features (`distressAudioFeatures`)
3. Classifier (`distressVoiceClassifier`)
4. Optional YAMNet ONNX (`yamnetDistressInference`) — dev client only

## Existing tests

- **4 golden fixtures** in `novadrive-mobile/src/lib/__fixtures__/distressVoiceVectors.ts`
- Unit tests assert expected hits/misses on synthetic vectors — **not** field audio

## Target evaluation (post-hackathon)

Collect **50 clips** (minimum):

| Class | Count | Examples |
|-------|-------|----------|
| True distress | 15 | Yells, screams in cabin |
| True negative | 20 | Highway noise, wind, truck pass-by |
| False-positive prone | 15 | Music, passengers talking, notification tones |

Report:

- Confusion matrix (TP, FP, TN, FN)
- Thresholds: dB gate, spectral centroid range, classifier score cutoffs
- Notes on Expo Go vs dev-client YAMNet delta

## UI labeling

Profile → **Voice Crash Detection** marked **Experimental — confirm manually**.

## Results

| Metric | Value |
|--------|-------|
| Precision | _TBD_ |
| Recall | _TBD_ |
| FPR on highway noise | _TBD_ |

Fill after clip collection.
