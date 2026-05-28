type Handlers = {
  markTtsMute: (estimatedSpeechMs: number) => void;
};

let handlers: Handlers | null = null;

export function registerVoicePolicyHandlers(next: Handlers | null): void {
  handlers = next;
}

export function notifyTtsPlayback(message: string): void {
  const estimatedSpeechMs = Math.max(1_200, message.trim().length * 55);
  handlers?.markTtsMute(estimatedSpeechMs);
}
