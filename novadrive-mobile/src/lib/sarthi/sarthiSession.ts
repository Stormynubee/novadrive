let greetingShownThisSession = false;

export function shouldShowDashboardGreeting(): boolean {
  return !greetingShownThisSession;
}

export function markDashboardGreetingShown(): void {
  greetingShownThisSession = true;
}

/** Test-only reset */
export function resetSarthiSessionForTests(): void {
  greetingShownThisSession = false;
}
