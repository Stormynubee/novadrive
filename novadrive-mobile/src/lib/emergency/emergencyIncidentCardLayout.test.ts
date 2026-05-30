import { incidentCardOverflow, priorityBadgeTopOffset } from './emergencyIncidentCardLayout';

describe('emergencyIncidentCardLayout', () => {
  it('keeps priority badge inside the card bounds', () => {
    expect(priorityBadgeTopOffset()).toBe(12);
    expect(incidentCardOverflow()).toBe('visible');
  });
});
