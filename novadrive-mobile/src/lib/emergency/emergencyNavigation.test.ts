import {
  EMERGENCY_ACTIVATION_PATH,
  EMERGENCY_SELECTION_PATH,
  shouldGateTriageWithoutIncident,
} from './emergencyNavigation';

describe('emergencyNavigation', () => {
  it('uses the emergency activation route for all SOS entry points', () => {
    expect(EMERGENCY_ACTIVATION_PATH).toBe('/emergency/activation');
    expect(EMERGENCY_SELECTION_PATH).toBe(EMERGENCY_ACTIVATION_PATH);
  });

  it('blocks triage until an incident type is chosen', () => {
    expect(shouldGateTriageWithoutIncident(undefined)).toBe(true);
    expect(shouldGateTriageWithoutIncident('road_accident')).toBe(false);
  });
});
