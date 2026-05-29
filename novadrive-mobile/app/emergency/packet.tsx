import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { DispatchPanel } from '../../src/components/DispatchPanel';
import { EmergencyStepShell } from '../../src/components/EmergencyStepShell';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { MargiButton } from '../../src/components/MargiButton';
import { QrQuietZone } from '../../src/components/QrQuietZone';
import { SeverityHero } from '../../src/components/SeverityHero';
import { useApp } from '../../src/context/AppContext';
import { encodeQrPayload, formatSms } from '../../src/lib/ghp';
import { tokens } from '../../src/theme/tokens';

export default function PacketScreen() {
  const { buildGhp, session, triageResult, profile } = useApp();
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState('');
  const [error, setError] = useState<string | null>(null);
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!loading) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [loading, pulse]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await buildGhp();
      if (cancelled) return;
      if (p) {
        setQr(encodeQrPayload(p));
        setError(null);
      } else {
        setError(
          !session.location
            ? 'Missing location — go back to Locate.'
            : !session.triage
              ? 'Missing triage — complete START first.'
              : 'Select a facility on Route (or use BLACK → 108).'
        );
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const packet = session.packet;
  const sms = packet ? formatSms(packet, profile.medical) : '';
  const sha = packet?.integrity?.slice(0, 12);

  const footer = error ? (
    <MargiButton label="Back to route" onPress={() => router.back()} variant="secondary" large />
  ) : (
    <MargiButton label="Continue to relay" onPress={() => router.push('/emergency/relay')} disabled={!packet} large />
  );

  return (
    <EmergencyStepShell
      step="Packet"
      title="Golden Hour Packet"
      subtitle="Share this with bystanders or dispatch — works offline."
      showBack
      footer={footer}
    >
      {loading ? (
        <Animated.View style={[styles.skeleton, { opacity: pulse }]} />
      ) : null}
      {error && !loading ? (
        <HudCard accent="danger">
          <HudText variant="bodyMd" style={{ color: tokens.onErrorContainer, lineHeight: 22 }}>
            {error}
          </HudText>
        </HudCard>
      ) : null}
      {triageResult && !loading ? <SeverityHero triage={triageResult} /> : null}
      {sms && !loading ? <DispatchPanel text={sms} /> : null}
      {sha ? (
        <HudText variant="mono" style={styles.sha}>
          {`SHA-256: ${sha}…`}
        </HudText>
      ) : null}
      {qr && !loading ? (
        <QrQuietZone>
          <QRCode value={qr} size={210} backgroundColor="#ffffff" color={tokens.primary} />
        </QrQuietZone>
      ) : null}
      {loading ? <ActivityIndicator color={tokens.primary} style={{ marginTop: 8 }} /> : null}
    </EmergencyStepShell>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    height: 140,
    borderRadius: tokens.radius.card,
    backgroundColor: tokens.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
  },
  sha: {
    fontSize: 10,
    color: tokens.onSurfaceVariant,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
});
