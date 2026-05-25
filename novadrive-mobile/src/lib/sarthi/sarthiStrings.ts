import type { Lang } from '../types';
import type { SarthiUserContext } from '../sarthiTypes';

export const sarthiStrings = {
  guestName: {
    en: 'Guest driver',
    hi: 'अतिथि चालक',
    ta: 'விருந்தினர் ஓட்டுநர்',
  },
  dashboardGreeting: {
    en: "I'm here to help you.",
    hi: 'मैं आपकी मदद के लिए यहाँ हूँ।',
    ta: 'நான் உங்களுக்கு உதவ இங்கே இருக்கிறேன்.',
  },
  welcome: {
    en: '{{name}}, I am Sarthi — powered by NovaDrive. Encrypted session started. Ask about your corridor, SOS, or safety plan.',
    hi: '{{name}}, मैं सारथी हूँ — NovaDrive द्वारा संचालित। सुरक्षित सत्र शुरू। कॉरिडोर, SOS या सुरक्षा योजना पूछें।',
    ta: '{{name}}, நான் சார்த்தி — NovaDrive மூலம். பாதுகாப்பான அமர்வு தொடங்கியது. காரிடார், SOS அல்லது பாதுகாப்பு திட்டம் கேளுங்கள்.',
  },
  fallback: {
    en: '{{name}}, I am Sarthi. Ask about corridors, SOS, triage, breakdowns, or offline safety. Profile → Settings for language.',
    hi: '{{name}}, मैं सारथी हूँ। कॉरिडोर, SOS, ट्राइएज, खराबी या ऑफ़लाइन सुरक्षा पूछें। भाषा के लिए सेटिंग्स देखें।',
    ta: '{{name}}, நான் சார்த்தி. காரிடார், SOS, ட்ரையேஜ், பழுது அல்லது ஆஃப்லைன் பாதுகாப்பு கேளுங்கள். மொழிக்கு அமைப்புகள்.',
  },
} as const;

const modeLabels: Record<SarthiUserContext['mode'], Record<Lang, string>> = {
  guest: { en: 'a guest', hi: 'अतिथि', ta: 'விருந்தினர்' },
  auth: { en: 'a signed-in user', hi: 'साइन-इन उपयोगकर्ता', ta: 'உள்நுழைந்த பயனர்' },
};

const corridorDefault: Record<Lang, string> = {
  en: 'your planned corridor',
  hi: 'आपका नियोजित कॉरिडोर',
  ta: 'உங்கள் திட்டமிட்ட காரிடார்',
};

export function formatSarthiReply(template: string, ctx: SarthiUserContext): string {
  const name =
    ctx.displayName?.trim() ||
    sarthiStrings.guestName[ctx.language] ||
    sarthiStrings.guestName.en;
  const corridor = ctx.corridorLabel?.trim() || corridorDefault[ctx.language];
  const mode = modeLabels[ctx.mode][ctx.language];
  return template
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{corridor\}\}/g, corridor)
    .replace(/\{\{mode\}\}/g, mode);
}

export function getWelcomeMessage(ctx: SarthiUserContext): string {
  return formatSarthiReply(sarthiStrings.welcome[ctx.language], ctx);
}

export function getDashboardGreeting(ctx: SarthiUserContext): string {
  return sarthiStrings.dashboardGreeting[ctx.language];
}

export function getFallbackMessage(ctx: SarthiUserContext): string {
  return formatSarthiReply(sarthiStrings.fallback[ctx.language], ctx);
}
