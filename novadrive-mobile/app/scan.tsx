import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Linking from 'expo-linking';
import { MaterialIcons } from '@expo/vector-icons';
import { HudCard } from '../src/components/HudCard';
import { HudText } from '../src/components/HudText';
import { MargiButton } from '../src/components/MargiButton';
import { MargiTopBar } from '../src/components/MargiTopBar';
import { ScreenShell } from '../src/components/ScreenShell';
import { decodeQrPayload, formatSms } from '../src/lib/ghp';
import { saveRelayPacket } from '../src/lib/storage';
import type { GoldenHourPacket } from '../src/lib/types';
import { tokens } from '../src/theme/tokens';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [packet, setPacket] = useState<GoldenHourPacket | null>(null);

  if (!permission) {
    return (
      <ScreenShell title="Scan" subtitle="Loading camera…" hudBar showBack>
        <HudText variant="bodyMd">Initialising camera…</HudText>
      </ScreenShell>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenShell
        title="Scan relay QR"
        subtitle="Camera required to receive a bystander Golden Hour Packet."
        hudBar
        showBack
      >
        <HudCard accent="primary">
          <HudText variant="bodyMd" style={styles.permissionBody}>
            Tap below to grant camera access. The camera is used only on this screen, never in
            the background.
          </HudText>
          <MargiButton
            label="Grant camera"
            onPress={requestPermission}
            variant="secondary"
            style={{ marginTop: 14 }}
          />
        </HudCard>
      </ScreenShell>
    );
  }

  const onBarcode = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    const decoded = decodeQrPayload(data);
    if (!decoded) {
      Alert.alert('Invalid QR', 'Could not decode the Margi packet.');
      setScanned(false);
      return;
    }
    const stub: GoldenHourPacket = {
      id: decoded.id,
      createdAt: new Date().toISOString(),
      triage: decoded.triage as GoldenHourPacket['triage'],
      location: {
        lat: decoded.lat,
        lng: decoded.lng,
        capturedAt: new Date().toISOString(),
      },
      victims: {
        count: 1,
        canWalk: decoded.triage === 'GREEN',
        breathing: decoded.triage !== 'BLACK',
        severeBleeding: decoded.triage === 'RED',
        capillaryRefillOk: decoded.triage !== 'RED',
        followsCommands: decoded.triage === 'GREEN' || decoded.triage === 'YELLOW',
      },
      routing: {
        facilityName: 'From QR relay',
        facilityType: 'hospital',
        phone: '108',
        etaMinutes: 0,
        distanceKm: 0,
      },
      emergency: { dial: '108', state: 'Tamil Nadu', language: 'en' },
      integrity: decoded.integrity,
    };
    await saveRelayPacket(stub);
    setPacket(stub);
    Alert.alert(
      'Relay saved',
      `Packet verified locally. Hash ${decoded.integrity.slice(0, 12)}…`
    );
  };

  const sms = async () => {
    if (!packet) return;
    try {
      const body = encodeURIComponent(formatSms(packet));
      const url = `sms:108?body=${body}`;
      const ok = await Linking.canOpenURL(url);
      if (!ok) {
        Alert.alert('SMS 108', formatSms(packet));
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('SMS 108', formatSms(packet));
    }
  };

  if (scanned && packet) {
    return (
      <View style={styles.root}>
        <MargiTopBar title="RELAY RECEIVED" subtitle="Golden Hour Packet" showBack />
        <ScrollView contentContainerStyle={styles.relayScroll}>
          <HudCard accent="tertiary">
            <View style={styles.relayHead}>
              <View style={styles.relayIcon}>
                <MaterialIcons name="verified" size={22} color={tokens.tertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <HudText variant="bodyMd" style={styles.relayTitle}>
                  Packet verified
                </HudText>
                <HudText variant="mono" style={styles.relayHash}>
                  SHA-256 · {packet.integrity.slice(0, 12)}…
                </HudText>
              </View>
            </View>
          </HudCard>
          <HudText variant="mono" style={styles.smsLabel}>
            HUMAN-READABLE PACKET
          </HudText>
          <View style={styles.smsBody}>
            <HudText variant="monoData" style={styles.smsText}>
              {formatSms(packet)}
            </HudText>
          </View>
          <MargiButton label="SMS 108" onPress={sms} variant="secondary" large />
          <MargiButton label="Done" onPress={() => router.back()} variant="ghost" />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onBarcode}
      />
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color={tokens.onPrimary} />
      </Pressable>
      <View style={styles.viewport}>
        <View style={[styles.cornerTL, styles.corner]} />
        <View style={[styles.cornerTR, styles.corner]} />
        <View style={[styles.cornerBL, styles.corner]} />
        <View style={[styles.cornerBR, styles.corner]} />
      </View>
      <View style={styles.hint}>
        <HudText variant="bodyMd" style={styles.hintText}>
          Point at a Margi relay QR
        </HudText>
      </View>
    </View>
  );
}

const VIEW = 240;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  permissionBody: { color: tokens.onSurface, lineHeight: 22 },
  relayScroll: { padding: 20, gap: 14 },
  relayHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  relayIcon: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.iconWrap,
    backgroundColor: tokens.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relayTitle: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  relayHash: { color: tokens.onSurfaceVariant, marginTop: 2, fontSize: 10 },
  smsLabel: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: tokens.secondary,
  },
  smsBody: {
    backgroundColor: tokens.surfaceContainerLow,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    borderRadius: tokens.radius.card,
    padding: 14,
  },
  smsText: { color: tokens.primary, fontSize: 13, lineHeight: 20 },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,10,30,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  viewport: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: VIEW,
    height: VIEW,
    marginLeft: -VIEW / 2,
    marginTop: -VIEW / 2,
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: tokens.secondary,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  hint: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    color: tokens.onPrimary,
    backgroundColor: 'rgba(0,10,30,0.8)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
    fontFamily: 'PublicSans_700Bold',
  },
});
