import { StyleSheet, Switch, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';

type Props = {
  active: boolean;
  onToggle: (next: boolean) => void;
};

export function NaariSafetyToggle({ active, onToggle }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="female" size={26} color={tokens.secondaryContainer} />
      </View>
      <View style={styles.text}>
        <HudText variant="bodyMd" style={styles.title}>
          Safety Mode
        </HudText>
        <HudText variant="bodySm" style={styles.sub}>
          {active ? 'ACTIVE • ENHANCED' : 'OFF'}
        </HudText>
      </View>
      <Switch
        value={active}
        onValueChange={onToggle}
        trackColor={{ false: 'rgba(255,255,255,0.2)', true: tokens.secondaryContainer }}
        thumbColor={tokens.onPrimary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: tokens.radius.card,
    backgroundColor: tokens.primary,
    marginTop: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(254, 107, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  title: { color: tokens.onPrimary, fontFamily: 'PublicSans_700Bold' },
  sub: { color: tokens.secondaryContainer, marginTop: 2, fontFamily: 'PublicSans_700Bold' },
});
