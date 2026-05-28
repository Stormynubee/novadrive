const SAMPLE_RATE = 16_000;

export type DistressAudioFeatures = {
  highBandRatio: number;
  zcr: number;
  crestFactor: number;
};

function goertzelPower(samples: Float32Array, targetHz: number): number {
  const k = Math.round((samples.length * targetHz) / SAMPLE_RATE);
  const w = (2 * Math.PI * k) / samples.length;
  const cosine = Math.cos(w);
  const coeff = 2 * cosine;
  let s0 = 0;
  let s1 = 0;
  let s2 = 0;
  for (let i = 0; i < samples.length; i++) {
    s0 = samples[i] + coeff * s1 - s2;
    s2 = s1;
    s1 = s0;
  }
  const power = s1 * s1 + s2 * s2 - coeff * s1 * s2;
  return Math.max(0, power);
}

function bandEnergy(samples: Float32Array, centerHz: number): number {
  return goertzelPower(samples, centerHz);
}

export function extractDistressAudioFeatures(samples: Float32Array): DistressAudioFeatures {
  if (samples.length === 0) {
    return { highBandRatio: 0, zcr: 0, crestFactor: 1 };
  }

  let sumSq = 0;
  let peak = 0;
  let crossings = 0;
  let prevSign = Math.sign(samples[0]) || 1;

  for (let i = 0; i < samples.length; i++) {
    const v = samples[i];
    const av = Math.abs(v);
    sumSq += v * v;
    peak = Math.max(peak, av);
    const sign = Math.sign(v) || prevSign;
    if (i > 0 && sign !== prevSign) crossings += 1;
    prevSign = sign;
  }

  const rms = Math.sqrt(sumSq / samples.length) || 1e-9;
  const crestFactor = peak / rms;

  const low = bandEnergy(samples, 150) + bandEnergy(samples, 300);
  const mid = bandEnergy(samples, 900) + bandEnergy(samples, 1400);
  const high = bandEnergy(samples, 2000) + bandEnergy(samples, 3200);
  const total = low + mid + high || 1e-9;
  const highBandRatio = high / total;

  const zcr = crossings / samples.length;

  return {
    highBandRatio: Math.min(1, highBandRatio),
    zcr: Math.min(1, zcr),
    crestFactor,
  };
}

/** Metering-only proxy when PCM is unavailable (expo-audio recorder). */
export function estimateMeteringProxies(
  meteringDb: number,
  aboveBaseline: number
): DistressAudioFeatures {
  const loudness = Math.max(0, Math.min(1, (meteringDb + 48) / 28));
  const spike = Math.max(0, Math.min(1, aboveBaseline / 18));
  return {
    highBandRatio: loudness * 0.35 + spike * 0.55,
    zcr: 0.08 + spike * 0.38,
    crestFactor: 1.2 + spike * 2.8,
  };
}

export function generateSineBuffer(freqHz: number, durationMs: number, amplitude = 0.5): Float32Array {
  const n = Math.floor((SAMPLE_RATE * durationMs) / 1000);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = amplitude * Math.sin((2 * Math.PI * freqHz * i) / SAMPLE_RATE);
  }
  return out;
}

export function generateNoiseBuffer(durationMs: number, amplitude = 0.3): Float32Array {
  const n = Math.floor((SAMPLE_RATE * durationMs) / 1000);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = (Math.random() * 2 - 1) * amplitude;
  }
  return out;
}
