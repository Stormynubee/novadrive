export function unconfiguredDispatchMessage(): string {
  return 'Margi is coordinating responders offline. Call 108 or 112 now while we sync your location.';
}

export function dispatchStatusUserMessage(status: 'pending' | 'partial' | 'failed' | 'sent'): string {
  if (status === 'pending' || status === 'partial') {
    return 'Dispatch queued — responders are being notified with your live location.';
  }
  if (status === 'failed') {
    return 'Dispatch could not reach the server. Call 108 or 112 and keep this screen open.';
  }
  return 'Dispatch sent — trauma center and police have your location.';
}
