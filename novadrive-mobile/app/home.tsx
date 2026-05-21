import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { NovaButton } from '../src/components/NovaButton';
import { ScreenShell } from '../src/components/ScreenShell';
import { useApp } from '../src/context/AppContext';
import { colors } from '../src/theme/colors';

export default function HomeScreen() {
  const { profile, journeyStatus } = useApp();

  return (
    <ScreenShell
      title={`Happy journey${profile.name ? `, ${profile.name}` : ''}`}
      subtitle="Start journey for GPS HUD + crash watch. Hold SOS anytime during journey."
    >
      <View style={styles.card}>
        <Text style={styles.statLabel}>Journey</Text>
        <Text style={styles.statValue}>{journeyStatus}</Text>
      </View>
      <NovaButton label="Start journey" onPress={() => router.push('/journey')} />
      <NovaButton
        label="Emergency (no journey)"
        onPress={() => router.push('/emergency/locate')}
        variant="danger"
      />
      <NovaButton label="Scan bystander QR" onPress={() => router.push('/scan')} variant="secondary" />
      <Text style={styles.footer}>RoadSoS · IIT Madras Hackathon 2026 · Offline-first P0</Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: { color: colors.muted, fontSize: 12 },
  statValue: { color: colors.cyan, fontSize: 22, fontWeight: '700', marginTop: 4 },
  footer: { color: colors.muted, fontSize: 12, marginTop: 8, textAlign: 'center' },
});
