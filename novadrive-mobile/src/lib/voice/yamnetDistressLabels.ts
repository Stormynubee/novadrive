/** Subset of AudioSet / YAMNet labels used for distress scoring. */
export const YAMNET_DISTRESS_POSITIVE = [
  'Scream',
  'Screaming',
  'Yell',
  'Shout',
  'Crying, sobbing',
  'Groan',
  'Whimper',
] as const;

export const YAMNET_DISTRESS_NEGATIVE = [
  'Speech',
  'Conversation',
  'Music',
  'Telephone bell ringing',
  'Beep, bleep',
  'Clicking',
  'Vehicle horn, car horn, honking',
  'Laughter',
  'Television',
] as const;

export type YamnetLabelScore = { label: string; score: number };

export function scoreDistressFromYamnetLabels(
  labels: YamnetLabelScore[]
): { distress: number; topClass: string; suppressed: boolean } {
  let distressSum = 0;
  let negativeSum = 0;
  let topPositive = { label: '', score: 0 };

  for (const entry of labels) {
    const lower = entry.label.toLowerCase();
    if (YAMNET_DISTRESS_POSITIVE.some((p) => lower.includes(p.toLowerCase()))) {
      distressSum += entry.score;
      if (entry.score > topPositive.score) topPositive = entry;
    }
    if (YAMNET_DISTRESS_NEGATIVE.some((n) => lower.includes(n.toLowerCase()))) {
      negativeSum += entry.score;
    }
  }

  const distress = Math.max(0, distressSum - negativeSum * 0.35);
  const suppressed = negativeSum > distressSum && negativeSum > 0.25;

  return {
    distress: Math.min(1, distress),
    topClass: topPositive.label || 'unknown',
    suppressed,
  };
}
