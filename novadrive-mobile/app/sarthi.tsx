import { useMemo, useState } from 'react';
import {
  Alert,
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

export default function SarthiScreen() {
  const insets = useSafeAreaInsets();
  const { thread, loading, offlineMode, bffUnavailable, send, clearThread } = useSarthi();
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
      {offlineMode ? (
        <HudText variant="bodySm" style={styles.offlineBanner}>
          No network — Sarthi is using on-device safety rules
        </HudText>
      ) : bffUnavailable ? (
        <HudText variant="bodySm" style={styles.offlineBanner}>
          BFF not configured — on-device rules (set EXPO_PUBLIC_SARTHI_API_URL in .env)
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
        onMicPress={() =>
          Alert.alert('Voice input', 'Voice capture for Sarthi is coming in a follow-up build.')
        }
        disabled={loading}
      />
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          onPress={() => {
            clearThread();
            Alert.alert('History cleared', 'Sarthi thread reset.');
          }}
          style={styles.bottomIcon}
        >
          <MaterialIcons name="history" size={24} color={tokens.primary} />
        </Pressable>
        <Pressable
          style={styles.micFab}
          onPress={() =>
            Alert.alert('Voice input', 'Hold-to-talk for Sarthi is coming soon.')
          }
        >
          <MaterialIcons name="mic" size={28} color={tokens.onSecondary} />
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
  offlineBanner: {
    textAlign: 'center',
    color: tokens.secondaryDeep,
    backgroundColor: tokens.secondaryFixed,
    paddingVertical: 6,
  },
  list: { flex: 1 },
  listContent: { padding: tokens.spacing.gutter, paddingBottom: tokens.spacing.stackLg },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.sideMargin,
    paddingTop: tokens.spacing.base,
    backgroundColor: tokens.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.outlineVariant,
  },
  bottomIcon: { padding: 8 },
  micFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: tokens.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.elevation.sos,
  },
});
