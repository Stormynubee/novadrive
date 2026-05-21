import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { NovaButton } from '../src/components/NovaButton';
import { colors } from '../src/theme/colors';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>NovaDrive</Text>
      <Text style={styles.tagline}>Signal drops. The critical minute doesn't.</Text>
      <Text style={styles.body}>
        Offline-first emergency co-pilot for Indian highways. START triage, trauma-tier routing, and QR bystander relay.
      </Text>
      <NovaButton label="Get started" onPress={() => router.push('/auth')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 28, justifyContent: 'center', gap: 16 },
  logo: { color: colors.amber, fontSize: 36, fontWeight: '900' },
  tagline: { color: colors.text, fontSize: 18, fontWeight: '600' },
  body: { color: colors.muted, fontSize: 15, lineHeight: 22, marginBottom: 24 },
});
