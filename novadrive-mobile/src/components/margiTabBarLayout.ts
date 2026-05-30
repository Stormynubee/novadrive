import type { ViewStyle } from 'react-native';

/**
 * Tab-bar pill geometry spec.
 * Rule: paddingHorizontal must be > 1.5× paddingVertical so the pill *feels* curved,
 * not rectangular. The borderRadius 999 is meaningless without the right proportions.
 */
export function tabPillGeometry(): {
  paddingHorizontal: number;
  paddingVertical: number;
  borderRadius: number;
  minWidth: number;
} {
  return {
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: 999,
    minWidth: 64,
  };
}

/**
 * Community screen: Local Safety Alerts section layout spec.
 * The geo-badge ("Active strictly within 5km") must live in a column stack,
 * not inline in a space-between row with the section title.
 */
export function alertsSectionLayout(): {
  titleRow: ViewStyle;
  geoBadge: ViewStyle;
  statusRow: ViewStyle;
} {
  return {
    // outer wrapper stacks title + badge vertically
    titleRow: { flexDirection: 'column', gap: 6 },
    // pill chip with full-round radius
    geoBadge: {
      borderRadius: 99,
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    // status row (loading / locating) is a horizontal icon+text pair
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  };
}
