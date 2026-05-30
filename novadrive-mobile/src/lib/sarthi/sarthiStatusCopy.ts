export function sarthiConnectionBanner(input: {
  offlineMode: boolean;
  bffUnavailable: boolean;
}): string | null {
  if (input.offlineMode) {
    return 'Offline — Sarthi uses on-device safety guidance while you drive.';
  }
  if (input.bffUnavailable) {
    return 'Gemini is not responding — on-device safety KB only. Try “help”, “SOS”, or “crash”.';
  }
  return null;
}
