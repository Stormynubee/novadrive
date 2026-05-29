import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from './HudText';
import { tokens } from '../theme/tokens';

const DISCLAIMER =
  'Margi provides decision support only. It is not a medical diagnosis or certified triage. In an emergency, call 108/112 when possible. Facility data in this build is a demo seed — verify by phone.';

export function MedicalDisclaimerBanner({ compact }: { compact?: boolean }) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]} accessibilityRole="text">
      <MaterialIcons name="info-outline" size={compact ? 16 : 18} color={tokens.secondary} />
      <HudText variant="bodySm" style={styles.text}>
        {DISCLAIMER}
      </HudText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: tokens.radius.card,
    backgroundColor: tokens.secondaryFixed,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    marginBottom: 12,
  },
  wrapCompact: { padding: 10, marginBottom: 8 },
  text: { flex: 1, color: tokens.onSurfaceVariant, lineHeight: 18 },
});
