/** Fixed-size mono PCM ring @ 16 kHz for YAMNet windows (1.0 s = 16_000 samples). */
export class VoicePcmRingBuffer {
  private readonly capacity: number;
  private buffer: Float32Array;
  private writeIndex = 0;
  private filled = 0;

  constructor(capacitySamples = 16_000) {
    this.capacity = capacitySamples;
    this.buffer = new Float32Array(capacitySamples);
  }

  push(samples: Float32Array): void {
    for (let i = 0; i < samples.length; i++) {
      this.buffer[this.writeIndex] = samples[i];
      this.writeIndex = (this.writeIndex + 1) % this.capacity;
      this.filled = Math.min(this.capacity, this.filled + 1);
    }
  }

  get isFull(): boolean {
    return this.filled >= this.capacity;
  }

  /** Latest window in chronological order. */
  snapshot(): Float32Array {
    const out = new Float32Array(this.filled);
    const start = this.filled < this.capacity ? 0 : this.writeIndex;
    for (let i = 0; i < this.filled; i++) {
      out[i] = this.buffer[(start + i) % this.capacity];
    }
    return out;
  }

  clear(): void {
    this.writeIndex = 0;
    this.filled = 0;
    this.buffer.fill(0);
  }
}
