import type { Lang } from './types';

export type SarthiRole = 'user' | 'assistant' | 'system';

export type SarthiActionCard = {
  title: string;
  subtitle: string;
};

export type SarthiMessage = {
  id: string;
  role: SarthiRole;
  text: string;
  createdAt: number;
  actionCard?: SarthiActionCard;
};

export type SarthiJourneyContext = {
  journeyPhase: 'IDLE' | 'ACTIVE';
  corridorLabel?: string;
};

export type SarthiUserContext = SarthiJourneyContext & {
  language: Lang;
  displayName?: string;
  mode: 'guest' | 'auth';
  medicalSummary?: string;
  hasEmergencyContacts: boolean;
  regionalProtocols: boolean;
};

export type SarthiThread = {
  id: string;
  messages: SarthiMessage[];
  createdAt: number;
};

export type SarthiChatRequest = {
  messages: { role: 'user' | 'assistant'; content: string }[];
  context: SarthiUserContext;
};

export type SarthiChatResponse = {
  reply: string;
  actionCard?: SarthiActionCard;
};
