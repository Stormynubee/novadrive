import { createTraumaSessionEngine } from './traumaSession';

describe('traumaSession', () => {
  it('starts in syncing state and transitions with ticks', () => {
    const engine = createTraumaSessionEngine({ assessmentSeconds: 180 });
    const session = engine.startSession({
      incidentType: 'road_accident',
      language: 'en',
      userName: 'Riya',
    });

    expect(session.state).toBe('syncing');

    const afterSync = engine.advance(session.id, { seconds: 8 });
    expect(afterSync.state).toBe('dispatching');

    const afterDispatch = engine.advance(session.id, { seconds: 20 });
    expect(afterDispatch.state).toBe('awaitingAnswer');
  });

  it('emits severity and handoff when finalized', () => {
    const engine = createTraumaSessionEngine({ assessmentSeconds: 120 });
    const session = engine.startSession({
      incidentType: 'natural_calamity',
      language: 'ta',
      userName: 'Asha',
    });

    engine.recordAnswer(session.id, 'bleeding heavy from leg');
    engine.recordAnswer(session.id, 'patient conscious');

    const final = engine.finalize(session.id);
    expect(final.severity).toBeTruthy();
    expect(final.handoffSummary).toMatch(/patient/i);
    expect(final.recommendedFacilityType).toBe('trauma');
  });
});
