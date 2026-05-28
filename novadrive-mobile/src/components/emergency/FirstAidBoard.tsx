import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';

export function FirstAidBoard({
  actions,
  onPreset,
}: {
  actions: string[];
  onPreset: (message: string) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialIcons name="medical-services" size={20} color={tokens.tertiary} />
        <HudText variant="mono" style={styles.title}>
          OFFLINE FIRST AID BOARD
        </HudText>
      </View>
      <View style={styles.list}>
        {actions.slice(0, 3).map((action, index) => (
          <View key={`${action}_${index}`} style={styles.row}>
            <View style={styles.dot} />
            <HudText variant="bodyMd" style={styles.actionText}>
              {action}
            </HudText>
          </View>
        ))}
      </View>
      <View style={styles.pills}>
        <Pressable style={styles.pill} onPress={() => onPreset('Patient has chest pain and dizziness')}>
          <HudText variant="bodySm" style={styles.pillText}>
            Chest Pain
          </HudText>
        </Pressable>
        <Pressable style={styles.pill} onPress={() => onPreset('Heavy bleeding from leg')}>
          <HudText variant="bodySm" style={styles.pillText}>
            Bleeding
          </HudText>
        </Pressable>
        <Pressable style={styles.pill} onPress={() => onPreset('Patient unconscious and not breathing')}>
          <HudText variant="bodySm" style={styles.pillText}>
            Unconscious
          </HudText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    backgroundColor: tokens.surface,
    padding: 14,
    gap: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: tokens.primary, letterSpacing: 1, fontFamily: 'PublicSans_700Bold' },
  list: { gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    backgroundColor: tokens.secondary,
  },
  actionText: { flex: 1, color: tokens.onSurface, lineHeight: 22 },
  pills: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 12,
    minHeight: 36,
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    justifyContent: 'center',
    backgroundColor: tokens.surfaceContainerHigh,
  },
  pillText: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
});
