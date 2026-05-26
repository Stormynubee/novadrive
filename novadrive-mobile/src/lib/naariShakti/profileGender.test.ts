import { isOnboardingGenderComplete } from './profileGender';

describe('isOnboardingGenderComplete', () => {
  it('requires gender before onboarding completes', () => {
    expect(isOnboardingGenderComplete({ mode: 'guest' })).toBe(false);
    expect(isOnboardingGenderComplete({ mode: 'guest', gender: 'female' })).toBe(true);
    expect(isOnboardingGenderComplete({ mode: 'guest', gender: 'male' })).toBe(true);
  });
});
