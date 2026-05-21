import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Linking from 'expo-linking';
import { NovaButton } from '../src/components/NovaButton';
import { ScreenShell } from '../src/components/ScreenShell';
import { decodeQrPayload, formatSms } from '../src/lib/ghp';
import { saveRelayPacket } from '../src/lib/storage';
import type { GoldenHourPacket } from '../src/lib/types';
import { colors } from '../src/theme/colors';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [packet, setPacket] = useState<GoldenHourPacket | null>(null);

  if (!permission) {
    return (
      <ScreenShell title="Scan" subtitle="Loading camera…">
        <Text style={styles.hintText}>…</Text>
      </ScreenShell>
    );
  }
  if (!permission.granted) {
    return (
      <ScreenShell title="Scan relay QR" subtitle="Camera required for bystander relay.">
        <NovaButton label="Grant camera" onPress={requestPermission} />
      </ScreenShell>
    );
  }

  const onBarcode = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    const decoded = decodeQrPayload(data);
    if (!decoded) {
      Alert.alert('Invalid QR', 'Could not decode NovaDrive packet.');
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
        canWalk: false,
        breathing: true,
        severeBleeding: decoded.triage === 'RED',
        capillaryRefillOk: true,
        followsCommands: false,
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
    Alert.alert('Relay saved', `Packet ${decoded.id.slice(0, 8)}… verified and cached.`);
  };

  const sms = async () => {
    if (!packet) return;
    const body = encodeURIComponent(formatSms(packet));
    await Linking.openURL(`sms:108?body=${body}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {!scanned ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={onBarcode}
        />
      ) : (
        <ScreenShell title="Relay received" subtitle="Full GHP on screen; SMS when online.">
          {packet && <Text style={styles.mono}>{formatSms(packet)}</Text>}
          <NovaButton label="SMS 108" onPress={sms} />
          <NovaButton label="Done" onPress={() => router.back()} variant="secondary" />
        </ScreenShell>
      )}
      <View style={styles.hint}>
        <Text style={styles.hintText}>Point at NovaDrive QR</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  hintText: { color: colors.text, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 8 },
  mono: { color: colors.cyan, fontFamily: 'monospace', fontSize: 13 },
});
