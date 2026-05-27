import {
  HIGH_PRIORITY_INCIDENT_ID,
  INCIDENT_OPTIONS,
  getIncidentOption,
  type IncidentType,
} from './incidentCatalog';

describe('incidentCatalog', () => {
  it('lists three institutional incident types in display order', () => {
    const ids = INCIDENT_OPTIONS.map((o) => o.id);
    expect(ids).toEqual<IncidentType[]>([
      'road_accident',
      'natural_calamity',
      'human_crime',
    ]);
  });

  it('marks natural calamity as high priority with activate protocol CTA', () => {
    const calamity = getIncidentOption('natural_calamity');
    expect(calamity?.priority).toBe('high');
    expect(calamity?.ctaLabel).toBe('ACTIVATE PROTOCOL');
    expect(HIGH_PRIORITY_INCIDENT_ID).toBe('natural_calamity');
  });

  it('uses road accident and human crime CTAs from Stitch mock', () => {
    expect(getIncidentOption('road_accident')?.ctaLabel).toBe('INITIATE SOS');
    expect(getIncidentOption('human_crime')?.ctaLabel).toBe('URGENT DISPATCH');
  });
});
