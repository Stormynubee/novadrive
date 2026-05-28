import {
  extractDistressAudioFeatures,
  generateNoiseBuffer,
  generateSineBuffer,
} from './distressAudioFeatures';

describe('extractDistressAudioFeatures', () => {
  it('gives low high-band ratio for a low hum', () => {
    const hum = generateSineBuffer(120, 200);
    const f = extractDistressAudioFeatures(hum);
    expect(f.highBandRatio).toBeLessThan(0.35);
  });

  it('gives elevated high-band ratio for a 2 kHz tone', () => {
    const tone = generateSineBuffer(2000, 200);
    const f = extractDistressAudioFeatures(tone);
    expect(f.highBandRatio).toBeGreaterThan(0.35);
  });

  it('gives high crest factor for noise burst', () => {
    const noise = generateNoiseBuffer(200, 0.8);
    const f = extractDistressAudioFeatures(noise);
    expect(f.crestFactor).toBeGreaterThan(1.6);
  });
});
