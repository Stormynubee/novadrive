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
      <View style={styles.row}>
        <View style={styles.text}>
          <HudText variant="bodyMd" style={styles.name}>
            {name}
          </HudText>
          <HudText variant="bodySm" style={styles.meta}>
            {distanceKm} km • {etaMinutes} mins response time
          </HudText>
        </View>
        <Pressable style={styles.navBtn} onPress={onNavigate}>
          <HudText variant="bodySm" style={styles.navLabel}>
            NAVIGATE
          </HudText>
        </Pressable>
      </View>
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
    flex: 1,
  },
  label: { color: tokens.primary, fontFamily: 'PublicSans_700Bold', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  text: { flex: 1 },
  name: { fontFamily: 'PublicSans_700Bold', color: tokens.onSurface },
  meta: { color: tokens.onSurfaceVariant, marginTop: 4 },
  navBtn: {
    backgroundColor: tokens.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: tokens.radius.input,
  },
  navLabel: { color: tokens.onPrimary, fontFamily: 'PublicSans_700Bold' },
});
