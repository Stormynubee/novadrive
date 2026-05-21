import type { FSMContext } from './startTriageFSM';

export interface ParsedSlots {
  slots: Partial<FSMContext>;
  matched: string[];
}

const KEYWORDS: { re: RegExp; slots: Partial<FSMContext>; label: string }[] = [
  { re: /can'?t walk|unable to walk|not walking|cannot walk/i, slots: { canWalk: false }, label: 'cannot walk' },
  { re: /can walk|walking wounded|ambulatory/i, slots: { canWalk: true }, label: 'can walk' },
  { re: /not breathing|no breathing|stopped breathing/i, slots: { breathing: false }, label: 'not breathing' },
  { re: /breathing normally|is breathing|still breathing/i, slots: { breathing: true }, label: 'breathing' },
  { re: /breathing fast|gasping|rr high|rapid breath/i, slots: { respiratoryRateOver30: true }, label: 'fast breathing' },
  { re: /unconscious|not responding|no response|unresponsive/i, slots: { followsCommands: false }, label: 'unconscious' },
  { re: /weak pulse|no pulse|slow refill|capillary/i, slots: { capillaryRefillOk: false }, label: 'perfusion issue' },
  { re: /follows commands|responsive|awake/i, slots: { followsCommands: true }, label: 'responsive' },
];

export function parseEmergencyText(text: string): ParsedSlots {
  const slots: Partial<FSMContext> = {};
  const matched: string[] = [];
  for (const kw of KEYWORDS) {
    if (kw.re.test(text)) {
      Object.assign(slots, kw.slots);
      matched.push(kw.label);
    }
  }
  return { slots, matched };
}
