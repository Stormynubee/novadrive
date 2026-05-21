import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export function ScreenShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { a11y } = useApp();
  const scale = a11y.largeText ? 1.15 : 1;
  return (
    <SafeAreaView style={[styles.safe, a11y.highContrast && styles.highContrast]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { fontSize: 26 * scale }]}>{title}</Text>
        {subtitle ? <Text style={[styles.sub, { fontSize: 15 * scale }]}>{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  highContrast: { backgroundColor: '#000' },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { color: colors.text, fontWeight: '800', marginBottom: 6 },
  sub: { color: colors.muted, marginBottom: 20, lineHeight: 22 },
  body: { gap: 12 },
});
