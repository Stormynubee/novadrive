export type SafetyAlertReason = 'impact' | 'voice' | 'simulate';

export function safetyAlertTitle(reason: SafetyAlertReason): string {
  switch (reason) {
    case 'voice':
      return 'Distress signal detected';
    case 'impact':
      return 'Possible impact detected';
    case 'simulate':
      return 'Safety check (demo)';
    default:
      return 'Are you okay?';
  }
}

export function safetyAlertBody(reason: SafetyAlertReason): string {
  switch (reason) {
    case 'voice':
      return 'We heard elevated panic audio in the cabin. Nothing is sent automatically — confirm if you need help.';
    case 'impact':
      return 'Motion sensors flagged a possible accident. Nothing is sent automatically.';
    case 'simulate':
      return 'Judges demo — same calm flow as a real alert.';
    default:
      return 'Take a moment. Nothing is sent automatically.';
  }
}
