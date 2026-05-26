import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';

type Props = {
  displayName: string;
  verified: boolean;
};

export function NaariCitizenStatus({ displayName, verified }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.avatar}>
        <MaterialIcons name="person" size={40} color={tokens.primary} />
      </View>
      <View style={styles.text}>
        <HudText variant="mono" style={styles.label}>
          CITIZEN STATUS
        </HudText>
        <HudText variant="bodyMd" style={styles.name}>
          Verified User: {displayName}
        </HudText>
        {verified ? (
          <View style={styles.verifiedRow}>
            <MaterialIcons name="verified" size={16} color={tokens.onTertiaryContainer} />
            <HudText variant="bodySm" style={styles.verified}>
              Identity Confirmed
            </HudText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    backgroundColor: tokens.surfaceContainerLowest,
    flex: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: tokens.radius.input,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    backgroundColor: tokens.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, justifyContent: 'center' },
  label: { color: tokens.primary, fontFamily: 'PublicSans_700Bold', marginBottom: 4 },
  name: { fontFamily: 'PublicSans_700Bold', color: tokens.onSurface },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  verified: { color: tokens.onTertiaryContainer, fontFamily: 'PublicSans_700Bold' },
});
