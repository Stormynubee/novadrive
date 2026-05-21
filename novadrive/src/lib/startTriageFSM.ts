import type { TriageColor, TriageState } from './types';

export interface FSMContext {
  canWalk?: boolean;
  breathing?: boolean;
  airwayOk?: boolean;
  respiratoryRateOver30?: boolean;
  capillaryRefillOk?: boolean;
  followsCommands?: boolean;
}

export interface FSMQuestion {
  state: TriageState;
  prompt: string;
  promptHi?: string;
  options: { id: string; label: string; value: Partial<FSMContext> }[];
}

export function getQuestion(state: TriageState): FSMQuestion | null {
  switch (state) {
    case 'AMBULATORY':
      return {
        state,
        prompt: 'Can the injured person walk on their own?',
        promptHi: 'क्या घायल व्यक्ति खुद चल सकता है?',
        options: [
          { id: 'yes', label: 'Yes — can walk', value: { canWalk: true } },
          { id: 'no', label: 'No — cannot walk', value: { canWalk: false } },
          { id: 'unsure', label: 'Not sure', value: { canWalk: false } },
        ],
      };
    case 'BREATHING_CHECK':
      return {
        state,
        prompt: 'Are they breathing normally right now?',
        promptHi: 'क्या वे अभी सामान्य रूप से सांस ले रहे हैं?',
        options: [
          { id: 'yes', label: 'Yes, breathing', value: { breathing: true } },
          { id: 'no', label: 'No / not sure', value: { breathing: false } },
        ],
      };
    case 'AIRWAY_REPOSITION':
      return {
        state,
        prompt: 'After tilting head / opening airway — are they breathing now?',
        promptHi: 'सिर झुकाने के बाद — क्या अब सांस ले रहे हैं?',
        options: [
          { id: 'yes', label: 'Yes, breathing now', value: { airwayOk: true, breathing: true } },
          { id: 'no', label: 'Still not breathing', value: { airwayOk: false, breathing: false } },
        ],
      };
    case 'RESPIRATORY_RATE':
      return {
        state,
        prompt: 'Is breathing very fast (over 30 breaths per minute)?',
        promptHi: 'क्या सांस बहुत तेज है (30 से अधिक प्रति मिनट)?',
        options: [
          { id: 'yes', label: 'Yes — very fast', value: { respiratoryRateOver30: true } },
          { id: 'no', label: 'No — not that fast', value: { respiratoryRateOver30: false } },
        ],
      };
    case 'PERFUSION_CHECK':
      return {
        state,
        prompt: 'Radial pulse strong? Capillary refill under 2 seconds?',
        promptHi: 'नाड़ी मजबूत? नाखून रंग 2 सेकंड में वापस?',
        options: [
          { id: 'yes', label: 'Yes — pulse OK', value: { capillaryRefillOk: true } },
          { id: 'no', label: 'No / weak / slow refill', value: { capillaryRefillOk: false } },
        ],
      };
    case 'MENTAL_STATUS':
      return {
        state,
        prompt: 'Can they follow simple commands (e.g. squeeze my hand)?',
        promptHi: 'क्या वे सरल आदेश मान सकते हैं?',
        options: [
          { id: 'yes', label: 'Yes — follows commands', value: { followsCommands: true } },
          { id: 'no', label: 'No / confused / unconscious', value: { followsCommands: false } },
        ],
      };
    default:
      return null;
  }
}

export function initialState(): TriageState {
  return 'AMBULATORY';
}

export function applyAnswer(
  state: TriageState,
  ctx: FSMContext,
  value: Partial<FSMContext>
): { next: TriageState; result?: TriageColor; ctx: FSMContext } {
  const merged = { ...ctx, ...value };

  if (state === 'AMBULATORY') {
    if (merged.canWalk) return { next: 'TAGGED', result: 'GREEN', ctx: merged };
    return { next: 'BREATHING_CHECK', ctx: merged };
  }

  if (state === 'BREATHING_CHECK') {
    if (merged.breathing) return { next: 'RESPIRATORY_RATE', ctx: merged };
    return { next: 'AIRWAY_REPOSITION', ctx: merged };
  }

  if (state === 'AIRWAY_REPOSITION') {
    if (!merged.airwayOk) return { next: 'TAGGED', result: 'BLACK', ctx: merged };
    return { next: 'RESPIRATORY_RATE', ctx: merged };
  }

  if (state === 'RESPIRATORY_RATE') {
    if (merged.respiratoryRateOver30) return { next: 'TAGGED', result: 'RED', ctx: merged };
    return { next: 'PERFUSION_CHECK', ctx: merged };
  }

  if (state === 'PERFUSION_CHECK') {
    if (!merged.capillaryRefillOk) return { next: 'TAGGED', result: 'RED', ctx: merged };
    return { next: 'MENTAL_STATUS', ctx: merged };
  }

  if (state === 'MENTAL_STATUS') {
    if (!merged.followsCommands) return { next: 'TAGGED', result: 'RED', ctx: merged };
    return { next: 'TAGGED', result: 'YELLOW', ctx: merged };
  }

  return { next: 'TAGGED', ctx: merged };
}

export const TRIAGE_META: Record<
  TriageColor,
  { label: string; sub: string; className: string }
> = {
  RED: { label: 'IMMEDIATE', sub: 'Trauma center routing', className: 'severity-red' },
  YELLOW: { label: 'DELAYED', sub: 'Hospital with ER', className: 'severity-yellow' },
  GREEN: { label: 'MINOR', sub: 'Walking wounded', className: 'severity-green' },
  BLACK: { label: 'DECEASED', sub: 'Notify 108 / police', className: 'severity-black' },
};
