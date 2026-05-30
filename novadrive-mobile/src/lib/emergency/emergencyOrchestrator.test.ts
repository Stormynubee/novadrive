import type { Facility, UserProfile } from '../types';
import { buildMargiIceSmsBody, planEmergencyOrchestrator } from './emergencyOrchestratorPlan';
describe('buildMargiIceSmsBody', () => {
  it('includes GPS and incident context without dev env strings', () => {
    const body = buildMargiIceSmsBody({
      userName: 'Alex',
      lat: 13.05,
      lng: 80.2,
      incidentLabel: 'road accident',
    });
    expect(body).toContain('Alex');
    expect(body).toContain('13.05000');
    expect(body).not.toMatch(/EXPO_PUBLIC/i);
  });
});

describe('planEmergencyOrchestrator', () => {
  const profile: UserProfile = {
    mode: 'guest',
    name: 'Alex',
    medical: {
      primaryContact: { fullName: 'Mom', relationship: 'Parent', phone: '9999999999' },
    },
    settings: { notifyEmergencyContacts: true } as UserProfile['settings'],
  };

  it('opens ICE and 108 SMS when coords and ICE phone exist', () => {
    const plan = planEmergencyOrchestrator({
      profile,
      settings: { notifyEmergencyContacts: true, language: 'en' } as never,
      coords: { lat: 13.0, lng: 80.2 },
      incidentType: 'road_accident',
      nearestFacility: null,
    });
    expect(plan.openIceSms).toBe(true);
    expect(plan.open108Sms).toBe(true);
    expect(plan.icePhone).toBe('9999999999');
  });

  it('skips ICE when notifyEmergencyContacts is false', () => {
    const plan = planEmergencyOrchestrator({
      profile,
      settings: { notifyEmergencyContacts: false, language: 'en' } as never,
      coords: { lat: 13.0, lng: 80.2 },
      incidentType: 'road_accident',
      nearestFacility: null,
    });
    expect(plan.openIceSms).toBe(false);
    expect(plan.open108Sms).toBe(true);
  });

  it('opens maps when nearest facility has coords', () => {
    const facility: Facility = {
      id: 't1',
      name: 'Trauma Near',
      type: 'trauma',
      traumaTier: 1,
      phone: '108',
      distanceKm: 2,
      etaMinutes: 8,
      lat: 13.01,
      lng: 80.21,
      recommended: true,
    };
    const plan = planEmergencyOrchestrator({
      profile,
      settings: { notifyEmergencyContacts: true, language: 'en' } as never,
      coords: { lat: 13.0, lng: 80.2 },
      incidentType: 'road_accident',
      nearestFacility: facility,
    });
    expect(plan.openMaps).toBe(true);
    expect(plan.mapsTarget).toEqual({ lat: 13.01, lng: 80.21 });
  });
});
