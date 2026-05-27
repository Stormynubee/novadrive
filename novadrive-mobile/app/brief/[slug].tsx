import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NovaTopBar } from '../../src/components/NovaTopBar';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { NovaButton } from '../../src/components/NovaButton';
import { getBriefBySlug } from '../../src/lib/home/briefCatalog';
import { tokens } from '../../src/theme/tokens';

export default function SafetyBriefDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const brief = getBriefBySlug(typeof slug === 'string' ? slug : '');

  if (!brief) {
    return (
      <View style={[styles.root, { paddingBottom: insets.bottom }]}>
        <NovaTopBar title="Safety brief" showBack onBack={() => router.back()} variant="surface" />
        <View style={styles.center}>
          <HudText variant="headlineMd" style={styles.title}>
            Brief not found
          </HudText>
          <HudText variant="bodyMd" style={styles.muted}>
            This advisory may have been archived or the link is invalid.
          </HudText>
          <NovaButton label="Back to home" onPress={() => router.back()} large />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <NovaTopBar title={brief.title} showBack onBack={() => router.back()} variant="surface" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <HudText variant="bodySm" style={styles.issued}>
          {brief.issuedAt}
        </HudText>
        <HudCard style={styles.card}>
          {brief.paragraphs.map((p) => (
            <HudText key={p.slice(0, 24)} variant="bodyMd" style={styles.paragraph}>
              {p}
            </HudText>
          ))}
        </HudCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  scroll: { padding: tokens.spacing.gutter, paddingBottom: 32, gap: 12 },
  issued: { color: tokens.onSurfaceVariant },
  card: { gap: 14 },
  paragraph: { color: tokens.onSurface, lineHeight: 22 },
  center: {
    flex: 1,
    padding: tokens.spacing.gutter,
    justifyContent: 'center',
    gap: 12,
  },
  title: { color: tokens.primary },
  muted: { color: tokens.onSurfaceVariant, marginBottom: 8 },
});
