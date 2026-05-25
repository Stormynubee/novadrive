import { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { type Href, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SarthiChatHeader } from './SarthiChatHeader';
import { SarthiComposer } from './SarthiComposer';
import { SarthiMessageBubble } from './SarthiMessageBubble';
import { SarthiPatternBackground } from './SarthiPatternBackground';
import { SarthiTypingIndicator } from './SarthiTypingIndicator';
import { useSarthi } from '../../context/SarthiContext';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';

const TAB_BAR_OFFSET = 72;

export function SarthiMiniWindow({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { thread, loading, offlineMode, bffUnavailable, send } = useSarthi();
  const [draft, setDraft] = useState('');
  const height = Dimensions.get('window').height * 0.4;

  const recent = useMemo(() => thread.messages.slice(-4), [thread.messages]);

  if (!open) return null;

  const handleSend = async () => {
    const text = draft;
    setDraft('');
    await send(text);
  };

  return (
    <View
      style={[
        styles.panel,
        {
          height,
          bottom: insets.bottom + TAB_BAR_OFFSET + 8,
          marginHorizontal: tokens.spacing.gutter,
        },
      ]}
    >
      <SarthiPatternBackground />
      <SarthiChatHeader compact onClose={onClose} />
      {offlineMode ? (
        <HudText variant="bodySm" style={styles.banner}>
          No network — using on-device safety rules
        </HudText>
      ) : bffUnavailable ? (
        <HudText variant="bodySm" style={styles.banner}>
          BFF not configured — on-device rules (set EXPO_PUBLIC_SARTHI_API_URL)
        </HudText>
      ) : null}
      <FlatList
        data={recent}
        keyExtractor={(m) => m.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <SarthiMessageBubble message={item} />}
        ListFooterComponent={loading ? <SarthiTypingIndicator /> : null}
      />
      <Pressable
        style={styles.moreBtn}
        onPress={() => {
          onClose();
          router.push('/sarthi' as Href);
        }}
      >
        <HudText variant="bodyMd" style={styles.moreLabel}>
          More
        </HudText>
      </Pressable>
      <SarthiComposer
        value={draft}
        onChangeText={setDraft}
        onSend={handleSend}
        onMicPress={() => undefined}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 39,
    borderRadius: tokens.radius.sheet,
    overflow: 'hidden',
    backgroundColor: tokens.background,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    ...tokens.elevation.floating,
  },
  banner: {
    textAlign: 'center',
    color: tokens.secondaryDeep,
    backgroundColor: tokens.secondaryFixed,
    paddingVertical: 4,
  },
  list: { flex: 1 },
  listContent: { padding: tokens.spacing.gutter, gap: 4 },
  moreBtn: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  moreLabel: { color: tokens.secondary, fontFamily: 'PublicSans_600SemiBold' },
});
