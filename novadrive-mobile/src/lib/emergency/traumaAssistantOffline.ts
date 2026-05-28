import type { Lang } from '../types';

export type TraumaAssistantReply = {
  intent: 'bleeding' | 'airway_breathing' | 'consciousness' | 'general';
  message: string;
  actions: string[];
};

const BLEEDING_ACTIONS = [
  'Apply firm pressure with a clean cloth.',
  'Keep the injured limb elevated if possible.',
  'Do not remove embedded objects; stabilize around them.',
];

const AIRWAY_ACTIONS = [
  'Check airway and gently tilt head-chin if no spinal injury is suspected.',
  'If not breathing, begin chest compressions immediately.',
  'Continue until emergency services arrive or breathing resumes.',
];

const CONSCIOUS_ACTIONS = [
  'Keep the patient still and calm.',
  'Monitor responsiveness and breathing every 30 seconds.',
  'Do not give food or drink until medical staff assess.',
];

export function getOfflineTraumaReply(text: string, language: Lang): TraumaAssistantReply {
  const input = text.toLowerCase();
  const isBleeding = /bleed|blood|hemorrhage|wound/.test(input);
  const noBreathing = /not breathing|no breath|unconscious/.test(input);
  const conscious = /conscious|awake|responding/.test(input);

  if (isBleeding) {
    return {
      intent: 'bleeding',
      message:
        language === 'hi'
          ? 'Khoon bahna control karein. Kapde se dabav banaye rakhein.'
          : language === 'ta'
            ? 'Irathap pokkai kattupaduthungal. Suththa thuni alutham kodungal.'
            : 'Control bleeding now. Keep steady pressure on the wound.',
      actions: BLEEDING_ACTIONS,
    };
  }

  if (noBreathing) {
    return {
      intent: 'airway_breathing',
      message:
        language === 'hi'
          ? 'Saas ruk rahi hai. Turant CPR protocol follow karein.'
          : language === 'ta'
            ? 'Suvasa nilai illai. Udanadiya CPR muraiyai pinpatrungal.'
            : 'Breathing risk detected. Start airway and CPR protocol immediately.',
      actions: AIRWAY_ACTIONS,
    };
  }

  if (conscious) {
    return {
      intent: 'consciousness',
      message:
        language === 'hi'
          ? 'Rogi hosh mein hai. Use shaant rakhein.'
          : language === 'ta'
            ? 'Noyali unarvudan ullar. Avarai amaidhiyaga vaikkavum.'
            : 'Patient appears conscious. Keep them still and reassured.',
      actions: CONSCIOUS_ACTIONS,
    };
  }

  return {
    intent: 'general',
    message:
      language === 'hi'
        ? 'Sahayata raste mein hai. Chot ka sankshipt varnan dein.'
        : language === 'ta'
          ? 'Udhavi varugirathu. Kaayathai siru vivarathudan sollungal.'
          : 'Help is on the way. Share injury details briefly for better guidance.',
    actions: ['Check airway.', 'Control visible bleeding.', 'Keep patient warm and calm.'],
  };
}
