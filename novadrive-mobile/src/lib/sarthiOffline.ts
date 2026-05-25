import type { SarthiActionCard, SarthiUserContext } from './sarthiTypes';
import { formatSarthiReply, getFallbackMessage } from './sarthi/sarthiStrings';
import {
  matchKnowledgeBase,
  type SarthiKbMatch,
  shouldUseOfflineFirst,
} from './sarthi/sarthiKnowledgeBase';

export type SarthiOfflineResult = {
  reply: string;
  actionCard?: SarthiActionCard;
  kbMatch?: SarthiKbMatch | null;
};

export function getOfflineReply(text: string, context: SarthiUserContext): SarthiOfflineResult {
  const match = matchKnowledgeBase(text);
  if (match) {
    const { entry } = match;
    let reply = formatSarthiReply(entry.replies[context.language], context);

    if (entry.id === 'sos_help' && context.hasEmergencyContacts) {
      const nudge: Record<SarthiUserContext['language'], string> = {
        en: ' Your emergency contacts can be notified from Settings.',
        hi: ' सेटिंग्स से आपात संपर्कों को सूचित किया जा सकता है।',
        ta: ' அமைப்புகளிலிருந்து அவசர தொடர்புகளுக்கு அறிவிக்கலாம்.',
      };
      reply += nudge[context.language];
    }

    if (entry.id === 'profile_medical' && context.medicalSummary) {
      const med: Record<SarthiUserContext['language'], string> = {
        en: ` On file: ${context.medicalSummary}.`,
        hi: ` रिकॉर्ड: ${context.medicalSummary}.`,
        ta: ` பதிவு: ${context.medicalSummary}.`,
      };
      reply += med[context.language];
    }

    const card = entry.actionCards?.[context.language];
    return { reply, actionCard: card, kbMatch: match };
  }

  return {
    reply: getFallbackMessage(context),
    kbMatch: null,
  };
}

export { shouldUseOfflineFirst, matchKnowledgeBase };
