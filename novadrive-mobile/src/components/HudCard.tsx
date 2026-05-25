import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useThemeTokens } from '../theme/useThemeTokens';

type Accent = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'none';
type Variant = 'default' | 'inset' | 'hero' | 'telemetry';

/**
 * GovTech card — white surface, 1px outline, optional 4px left "status accent" stripe
 * (saffron for danger / urgent, navy for info, green for safe). DESIGN.md §Components/Cards.
 */
export function HudCard({
  children,
  style,
  accent = 'none',
  accentBorder,
  variant = 'default',
}: {
  children: ReactNode;
  style?: ViewStyle;
  accent?: Accent;
  /** @deprecated use accent */
  accentBorder?: Accent;
  variant?: Variant;
}) {
  const tokens = useThemeTokens();
  const resolvedAccent = accentBorder ?? accent;
  const accentColor =
    resolvedAccent === 'primary'
      ? tokens.primary
      : resolvedAccent === 'secondary'
        ? tokens.secondary
        : resolvedAccent === 'tertiary'
          ? tokens.tertiary
          : resolvedAccent === 'danger'
            ? tokens.error
            : null;

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: tokens.surface,
          borderColor: tokens.outlineVariant,
        },
        variant === 'inset' && [styles.inset, { backgroundColor: tokens.surfaceContainerLow }],
        variant === 'hero' && styles.hero,
        variant === 'telemetry' && styles.telemetry,
        accentColor ? { borderLeftWidth: 4, borderLeftColor: accentColor } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000a1e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  inset: {},
  hero: {
    padding: 20,
    borderWidth: 1.5,
  },
  telemetry: {
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});

export { HudCard as GlassCard };
