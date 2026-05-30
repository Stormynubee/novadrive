import {
  EMERGENCY_ACTIVATION_PATH,
  EMERGENCY_HOLD_ENTRY_PATH,
  EMERGENCY_SELECTION_PATH,
  DEFAULT_QUICK_SOS_INCIDENT,
  shouldRedirectActivationToSelection,
} from './emergencyNavigation';

describe('emergencyNavigation', () => {
  it('keeps selection and activation as separate routes', () => {
    expect(EMERGENCY_SELECTION_PATH).toBe('/emergency/selection');
    expect(EMERGENCY_ACTIVATION_PATH).toBe('/emergency/activation');
    expect(EMERGENCY_HOLD_ENTRY_PATH).toBe(EMERGENCY_SELECTION_PATH);
    expect(DEFAULT_QUICK_SOS_INCIDENT).toBe('road_accident');
  });

  it('blocks triage until an incident type is chosen', () => {
    expect(shouldRedirectActivationToSelection(undefined)).toBe(true);
    expect(shouldRedirectActivationToSelection('road_accident')).toBe(false);
  });
});
