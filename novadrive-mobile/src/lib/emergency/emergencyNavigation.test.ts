import {
  EMERGENCY_SELECTION_PATH,
  shouldGateTriageWithoutIncident,
} from './emergencyNavigation';

describe('emergencyNavigation', () => {
  it('uses the emergency selection route for all SOS entry points', () => {
    expect(EMERGENCY_SELECTION_PATH).toBe('/emergency/selection');
  });

  it('blocks triage until an incident type is chosen', () => {
    expect(shouldGateTriageWithoutIncident(undefined)).toBe(true);
    expect(shouldGateTriageWithoutIncident('road_accident')).toBe(false);
  });
});
