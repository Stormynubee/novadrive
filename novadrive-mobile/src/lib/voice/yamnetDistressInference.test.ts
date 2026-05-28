import { scoreDistressFromYamnetLogits } from './yamnetDistressInference';

const MOCK_LOGITS = [
  { label: 'Scream', score: 0.62 },
  { label: 'Speech', score: 0.18 },
  { label: 'Music', score: 0.05 },
];

describe('scoreDistressFromYamnetLogits', () => {
  it('aggregates distress classes above threshold', () => {
    const score = scoreDistressFromYamnetLogits(MOCK_LOGITS);
    expect(score.distress).toBeGreaterThan(0.5);
    expect(score.topClass).toMatch(/Scream/i);
  });

  it('suppresses when negative classes dominate', () => {
    const score = scoreDistressFromYamnetLogits([
      { label: 'Scream', score: 0.1 },
      { label: 'Speech', score: 0.7 },
      { label: 'Conversation', score: 0.15 },
    ]);
    expect(score.suppressed).toBe(true);
  });
});
