import { VoicePcmRingBuffer } from './voicePcmRingBuffer';

describe('VoicePcmRingBuffer', () => {
  it('returns chronological snapshot when full', () => {
    const ring = new VoicePcmRingBuffer(4);
    ring.push(new Float32Array([1, 2]));
    ring.push(new Float32Array([3, 4]));
    expect(ring.isFull).toBe(true);
    expect(Array.from(ring.snapshot())).toEqual([1, 2, 3, 4]);
  });
});
