import { type Href, router } from 'expo-router';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { MargiButton } from '../../src/components/MargiButton';
import { MargiTopBar } from '../../src/components/MargiTopBar';
import { MORTH_GOOD_SAMARITAN_URL, RAHVEER_PROGRAM_COPY } from '../../src/lib/rahveerLinks';
import { tokens } from '../../src/theme/tokens';

export default function RahVeerIndexScreen() {
  return (
    <View style={styles.root}>
      <MargiTopBar title="Rah-Veer" subtitle="Good Samaritan" showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <HudCard accent="primary">
          <View style={styles.head}>
            <MaterialIcons name="volunteer-activism" size={28} color={tokens.primary} />
            <HudText variant="headlineMd" style={styles.title}>
              Government Good Samaritan
            </HudText>
          </View>
          <HudText variant="bodyMd" style={styles.body}>
            {RAHVEER_PROGRAM_COPY}
          </HudText>
          <HudText variant="bodySm" style={styles.legal}>
            Legal protection up to ₹25,000 in eligible cases is framed under national Good Samaritan
            guidelines — verify details on the official MoRTH portal.
          </HudText>
          <MargiButton
            label="Open MoRTH portal"
            variant="secondary"
            style={{ marginTop: 14 }}
            onPress={() => Linking.openURL(MORTH_GOOD_SAMARITAN_URL)}
          />
        </HudCard>
        <MargiButton
          label="View local claim tickets"
          onPress={() => router.push('/rahveer/claim' as Href)}
          large
        />
        <MargiButton
          label="Scan relay QR"
          variant="ghost"
          onPress={() => router.push('/scan' as Href)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  scroll: { padding: 20, gap: 16, paddingBottom: 48 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  title: { color: tokens.primary, flex: 1 },
  body: { color: tokens.onSurface, lineHeight: 22 },
  legal: { color: tokens.onSurfaceVariant, marginTop: 12, lineHeight: 20 },
});
