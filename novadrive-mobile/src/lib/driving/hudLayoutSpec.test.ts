import { getHudLayoutSpec, hudZoneOrder, HUD_SPEEDO_SIZE, HUD_SOS_ZONE } from './hudLayoutSpec';

describe('getHudLayoutSpec', () => {
  it('places SOS at top with compact speedometer', () => {
    const spec = getHudLayoutSpec();
    expect(spec.sosZone).toBe('top');
    expect(spec.sosZone).toBe(HUD_SOS_ZONE);
    expect(spec.speedoSize).toBeLessThanOrEqual(180);
    expect(spec.speedoSize).toBe(HUD_SPEEDO_SIZE);
    expect(spec.scrollWhileDriving).toBe(false);
  });
});

describe('hudZoneOrder', () => {
  it('orders SOS before speedometer', () => {
    const order = hudZoneOrder();
    expect(order.indexOf('sos')).toBeLessThan(order.indexOf('speedometer'));
  });
});
