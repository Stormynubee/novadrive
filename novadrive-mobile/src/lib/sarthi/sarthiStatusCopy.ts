export function sarthiConnectionBanner(input: {
  offlineMode: boolean;
  bffUnavailable: boolean;
}): string | null {
  if (input.offlineMode) {
    return 'Offline — Sarthi uses on-device safety guidance while you drive.';
  }
  if (input.bffUnavailable) {
    return 'Sarthi is using on-device safety guidance. Cloud assistant reconnects when online.';
  }
  return null;
}
