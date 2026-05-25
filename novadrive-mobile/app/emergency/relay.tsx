import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Alert, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { EmergencyStepShell } from '../../src/components/EmergencyStepShell';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { NovaButton } from '../../src/components/NovaButton';
import { useApp } from '../../src/context/AppContext';
import { formatSms } from '../../src/lib/ghp';
import { saveRelayPacket } from '../../src/lib/storage';
import { tokens } from '../../src/theme/tokens';

function StepBlock({
  num,
  title,
  body,
  cta,
  icon,
  tone = 'primary',
}: {
  num: number;
  title: string;
  body: string;
  cta: { label: string; onPress: () => void; variant?: 'secondary' | 'ghost' | 'mint' };
  icon: keyof typeof MaterialIcons.glyphMap;
  tone?: 'primary' | 'secondary' | 'tertiary';
}) {
  return (
    <HudCard accent={tone}>
      <View style={styles.stepHead}>
        <View
          style={[
            styles.stepNum,
            tone === 'secondary' && { backgroundColor: tokens.secondaryFixed },
            tone === 'tertiary' && { backgroundColor: tokens.tertiaryContainer },
          ]}
        >
          <HudText
            variant="mono"
            style={[
              styles.stepNumText,
              tone === 'secondary' && { color: tokens.secondary },
              tone === 'tertiary' && { color: tokens.tertiary },
            ]}
          >
            {num}
          </HudText>
        </View>
        <View style={{ flex: 1 }}>
          <HudText variant="bodyMd" style={styles.stepTitle}>
            {title}
          </HudText>
          <HudText variant="bodySm" style={styles.stepBody}>
            {body}
          </HudText>
        </View>
        <MaterialIcons
          name={icon}
          size={22}
          color={
            tone === 'secondary'
              ? tokens.secondary
              : tone === 'tertiary'
                ? tokens.tertiary
                : tokens.primary
          }
        />
      </View>
      <NovaButton
        label={cta.label}
        onPress={cta.onPress}
        variant={cta.variant ?? 'ghost'}
        style={{ marginTop: 14 }}
      />
    </HudCard>
  );
}

/**
 * Stitch phase 5 — relay options after the Golden Hour Packet is built. Save to encrypted local
 * relay store, draft 108 SMS, or scan a bystander QR. Each is a separate optional path; the
 * "Finish" CTA closes the emergency session.
 */
export default function RelayScreen() {
  const { session, resetEmergency, profile } = useApp();
  const packet = session.packet;

  const cacheRelay = async () => {
    if (!packet) return;
    await saveRelayPacket(packet);
    Alert.alert('Relay cached', 'Packet saved securely on this device for bystander handoff.');
  };

  const sms108 = async () => {
    if (!packet) return;
    const body = encodeURIComponent(formatSms(packet, profile.medical));
    const url = `sms:108?body=${body}`;
    const ok = await Linking.canOpenURL(url);
    if (!ok) {
      Alert.alert('SMS 108', formatSms(packet, profile.medical));
      return;
    }
    await Linking.openURL(url);
  };

  return (
    <EmergencyStepShell
      step="Relay"
      title="Relay & confirm"
      subtitle="When signal returns, one tap dials 108 with a human-readable packet."
      showBack
      footer={
        <NovaButton
          label="Finish & return home"
          variant="secondary"
          large
          onPress={() => {
            resetEmergency();
            router.replace('/(tabs)/explore');
          }}
        />
      }
    >
      <StepBlock
        num={1}
        title="Cache securely on this device"
        body="Encrypted handoff bundle for a bystander or co-driver."
        cta={{ label: 'Cache packet', onPress: cacheRelay, variant: 'mint' }}
        icon="lock"
        tone="tertiary"
      />
      <StepBlock
        num={2}
        title="Draft SMS to 108"
        body="Opens your messaging app with a structured human-readable packet."
        cta={{ label: 'SMS 108', onPress: sms108, variant: 'secondary' }}
        icon="sms"
        tone="secondary"
      />
      <StepBlock
        num={3}
        title="Scan bystander QR"
        body="Receive a relay packet from a second device via QR code."
        cta={{ label: 'Open scanner', onPress: () => router.push('/scan'), variant: 'ghost' }}
        icon="qr-code-scanner"
        tone="primary"
      />
    </EmergencyStepShell>
  );
}

const styles = StyleSheet.create({
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: tokens.primary,
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 16,
    lineHeight: 18,
  },
  stepTitle: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  stepBody: { color: tokens.onSurfaceVariant, marginTop: 2, lineHeight: 20 },
});
