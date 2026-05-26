import { Pressable, StyleSheet, View } from 'react-native';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';

type Props = {
  name: string;
  distanceKm: number;
  etaMinutes: number;
  onNavigate: () => void;
};

export function NaariNearestSafetyPoint({ name, distanceKm, etaMinutes, onNavigate }: Props) {
  return (
    <View style={styles.wrap}>
      <HudText variant="mono" style={styles.label}>
        NEAREST SAFETY POINT
      </HudText>
      <HudText variant="bodyMd" style={styles.name}>
        {name}
      </HudText>
      <HudText variant="bodySm" style={styles.meta}>
        {distanceKm} km • {etaMinutes} mins response time
      </HudText>
      <Pressable style={styles.navBtn} onPress={onNavigate}>
        <HudText variant="bodySm" style={styles.navLabel}>
          NAVIGATE
        </HudText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 16,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    backgroundColor: tokens.surfaceContainerLowest,
    width: '100%',
    gap: 8,
  },
  label: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  name: { fontFamily: 'PublicSans_700Bold', color: tokens.onSurface },
  meta: { color: tokens.onSurfaceVariant },
  navBtn: {
    alignSelf: 'flex-start',
    backgroundColor: tokens.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: tokens.radius.input,
    marginTop: 4,
  },
  navLabel: { color: tokens.onPrimary, fontFamily: 'PublicSans_700Bold' },
});
