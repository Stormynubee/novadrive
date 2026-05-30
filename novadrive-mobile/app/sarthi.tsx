import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SarthiChatHeader } from '../src/components/sarthi/SarthiChatHeader';
import { SarthiComposer } from '../src/components/sarthi/SarthiComposer';
import { SarthiMessageBubble } from '../src/components/sarthi/SarthiMessageBubble';
import { SarthiPatternBackground } from '../src/components/sarthi/SarthiPatternBackground';
import { SarthiTypingIndicator } from '../src/components/sarthi/SarthiTypingIndicator';
import { useSarthi } from '../src/context/SarthiContext';
import { HudText } from '../src/components/HudText';
import { tokens } from '../src/theme/tokens';

function sessionLabel() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function statusChipLabel(status: string, offlineMode: boolean): string {
  if (offlineMode) return 'Offline safety KB — no cloud required';
  if (status === 'online') return 'Gemini online';
  if (status === 'unconfigured') return 'Offline KB — set Sarthi BFF URL in .env';
  return 'Offline KB — BFF unreachable (deploy novadrive/)';
}

export default function SarthiScreen() {
  const insets = useSafeAreaInsets();
  const { thread, loading, offlineMode, bffStatus, send, clearThread } = useSarthi();
  const [draft, setDraft] = useState('');
  const sessionTime = useMemo(() => sessionLabel(), []);

  const handleSend = async () => {
    const text = draft;
    setDraft('');
    await send(text);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <SarthiPatternBackground />
      <SarthiChatHeader onClose={() => router.back()} />
      <View style={styles.sessionPill}>
        <MaterialIcons name="lock" size={14} color={tokens.tertiary} />
        <HudText variant="bodySm" style={styles.sessionText}>
          Encrypted session · {sessionTime}
        </HudText>
      </View>
      <View style={styles.statusChip}>
        <MaterialIcons
          name={bffStatus === 'online' && !offlineMode ? 'cloud-done' : 'cloud-off'}
          size={14}
          color={bffStatus === 'online' && !offlineMode ? tokens.tertiary : tokens.secondaryDeep}
        />
        <HudText variant="mono" style={styles.statusText}>
          {statusChipLabel(bffStatus, offlineMode)}
        </HudText>
      </View>
      {offlineMode || bffStatus !== 'online' ? (
        <HudText variant="bodySm" style={styles.offlineHint}>
          {bffStatus === 'online'
            ? 'Ask about SOS, START triage, GHP, or Naari Shakti — answers stay on-device.'
            : 'Cloud Sarthi needs the Next.js BFF (novadrive/). Try “help”, “SOS”, or “offline” for on-device answers. Run: node scripts/check-sarthi-bff.cjs'}
        </HudText>
      ) : null}
      <FlatList
        data={thread.messages}
        keyExtractor={(m) => m.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <SarthiMessageBubble message={item} />}
        ListFooterComponent={loading ? <SarthiTypingIndicator /> : null}
      />
      <SarthiComposer
        value={draft}
        onChangeText={setDraft}
        onSend={handleSend}
        disabled={loading}
      />
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable onPress={() => clearThread()} style={styles.bottomIcon}>
          <MaterialIcons name="history" size={24} color={tokens.primary} />
        </Pressable>
        <Pressable onPress={handleSend} style={styles.bottomIcon} disabled={loading || !draft.trim()}>
          <MaterialIcons name="send" size={24} color={tokens.secondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  sessionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginVertical: tokens.spacing.base,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: tokens.radius.chip,
    backgroundColor: tokens.tertiaryFixedDim,
  },
  sessionText: { color: tokens.onTertiaryContainer },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: tokens.radius.chip,
    backgroundColor: tokens.surfaceContainerHigh,
  },
  statusText: { fontSize: 10, color: tokens.onSurfaceVariant, letterSpacing: 0.8 },
  offlineHint: {
    textAlign: 'center',
    color: tokens.onSurfaceVariant,
    paddingHorizontal: 16,
    marginBottom: 8,
    lineHeight: 18,
  },
  list: { flex: 1 },
  listContent: { paddingHorizontal: tokens.spacing.gutter, paddingBottom: 12 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: tokens.outlineVariant,
    backgroundColor: tokens.surface,
  },
  bottomIcon: { padding: 12 },
});
