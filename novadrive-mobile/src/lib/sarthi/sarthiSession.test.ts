import {
  markDashboardGreetingShown,
  resetSarthiSessionForTests,
  shouldShowDashboardGreeting,
} from './sarthiSession';

describe('sarthiSession', () => {
  beforeEach(() => resetSarthiSessionForTests());

  it('shows greeting only once per session', () => {
    expect(shouldShowDashboardGreeting()).toBe(true);
    markDashboardGreetingShown();
    expect(shouldShowDashboardGreeting()).toBe(false);
  });
});
