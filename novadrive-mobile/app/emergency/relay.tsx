import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Alert, StyleSheet, Text } from 'react-native';
import { NovaButton } from '../../src/components/NovaButton';
import { ProgressRail } from '../../src/components/ProgressRail';
import { ScreenShell } from '../../src/components/ScreenShell';
import { useApp } from '../../src/context/AppContext';
import { formatSms } from '../../src/lib/ghp';
import { saveRelayPacket } from '../../src/lib/storage';
import { colors } from '../../src/theme/colors';

export default function RelayScreen() {
  const { session, resetEmergency } = useApp();
  const packet = session.packet;

  const cacheRelay = async () => {
    if (!packet) return;
    await saveRelayPacket(packet);
    Alert.alert('Relay cached', 'Packet saved securely for bystander handoff.');
  };

  const sms108 = async () => {
    if (!packet) return;
    const body = encodeURIComponent(formatSms(packet));
    const url = `sms:108?body=${body}`;
    const ok = await Linking.canOpenURL(url);
    if (!ok) {
      Alert.alert('SMS', formatSms(packet));
      return;
    }
    await Linking.openURL(url);
  };

  return (
    <ScreenShell title="Relay" subtitle="Show QR to bystander. SMS 108 when online — human-readable body.">
      <ProgressRail current="Relay" />
      <Text style={styles.note}>
        Airplane-mode test: build packet offline, scan on second device, relay when signal returns.
      </Text>
      <NovaButton label="Cache packet for relay" onPress={cacheRelay} />
      <NovaButton label="SMS 108 (when online)" onPress={sms108} variant="secondary" />
      <NovaButton label="Scan bystander QR" onPress={() => router.push('/scan')} variant="ghost" />
      <NovaButton
        label="Finish & reset"
        onPress={() => {
          resetEmergency();
          router.replace('/home');
        }}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  note: { color: colors.muted, lineHeight: 20 },
});
