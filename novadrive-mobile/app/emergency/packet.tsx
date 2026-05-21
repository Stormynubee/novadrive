import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { NovaButton } from '../../src/components/NovaButton';
import { ProgressRail } from '../../src/components/ProgressRail';
import { SeverityChip } from '../../src/components/SeverityChip';
import { ScreenShell } from '../../src/components/ScreenShell';
import { useApp } from '../../src/context/AppContext';
import { encodeQrPayload, formatSms } from '../../src/lib/ghp';
import { colors } from '../../src/theme/colors';

export default function PacketScreen() {
  const { buildGhp, session, triageResult } = useApp();
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState('');

  useEffect(() => {
    buildGhp().then((p) => {
      if (p) setQr(encodeQrPayload(p));
      setLoading(false);
    });
  }, [buildGhp]);

  const packet = session.packet;

  return (
    <ScreenShell title="Golden Hour Packet" subtitle="Human-readable SMS + compressed QR for bystander relay.">
      <ProgressRail current="Packet" />
      {loading && <ActivityIndicator color={colors.amber} />}
      {triageResult && <SeverityChip triage={triageResult} />}
      {packet && (
        <View style={styles.dispatch}>
          <Text style={styles.mono}>{formatSms(packet)}</Text>
        </View>
      )}
      {qr ? (
        <View style={styles.qrWrap}>
          <QRCode value={qr} size={200} backgroundColor="#151D2E" color="#FBBF24" />
        </View>
      ) : null}
      <NovaButton label="Continue to relay" onPress={() => router.push('/emergency/relay')} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  dispatch: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mono: { color: colors.text, fontFamily: 'monospace', fontSize: 13, lineHeight: 20 },
  qrWrap: { alignItems: 'center', padding: 16 },
});
