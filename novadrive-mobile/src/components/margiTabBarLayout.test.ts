import { tabPillGeometry, alertsSectionLayout } from './margiTabBarLayout';

describe('tabPillGeometry', () => {
  it('pill has larger horizontal padding than vertical so it reads as a pill not a box', () => {
    const g = tabPillGeometry();
    expect(g.paddingHorizontal).toBeGreaterThan(g.paddingVertical * 1.5);
  });

  it('pill uses maximum border radius (full-round)', () => {
    expect(tabPillGeometry().borderRadius).toBe(999);
  });

  it('pill has a defined minWidth wide enough to feel capsule-shaped', () => {
    const g = tabPillGeometry();
    // minWidth must be at least 64 so icon never sits in a square container
    expect(g.minWidth).toBeGreaterThanOrEqual(64);
  });
});

describe('alertsSectionLayout', () => {
  it('geo-badge is on its own row, not inline with the section title', () => {
    const layout = alertsSectionLayout();
    // title row should be column-stacked, not row with space-between
    expect(layout.titleRow.flexDirection).toBe('column');
  });

  it('geo-badge has a borderRadius making it a pill-chip', () => {
    expect(alertsSectionLayout().geoBadge.borderRadius).toBeGreaterThanOrEqual(99);
  });

  it('status row is a flex row so icon and text sit side by side', () => {
    expect(alertsSectionLayout().statusRow.flexDirection).toBe('row');
  });
});
