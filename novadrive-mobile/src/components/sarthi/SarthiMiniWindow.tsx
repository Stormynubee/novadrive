import { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { type Href, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { SarthiChatHeader } from './SarthiChatHeader';
import { SarthiComposer } from './SarthiComposer';
import { SarthiMessageBubble } from './SarthiMessageBubble';
import { SarthiPatternBackground } from './SarthiPatternBackground';
import { SarthiTypingIndicator } from './SarthiTypingIndicator';
import { useSarthi } from '../../context/SarthiContext';
import { HudText } from '../HudText';
import { sarthiConnectionBanner } from '../../lib/sarthi/sarthiStatusCopy';
import { tokens } from '../../theme/tokens';

const TAB_BAR_OFFSET = 88;

function SarthiQuickLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.quickRow} onPress={onPress}>
      <HudText variant="bodySm" style={styles.quickLabel}>
        {label}
      </HudText>
      <MaterialIcons name="arrow-forward" size={16} color={tokens.primary} />
    </Pressable>
  );
}

export function SarthiMiniWindow({
  open,
  onClose,
  showQuickLinks = false,
}: {
  open: boolean;
  onClose: () => void;
  showQuickLinks?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const { session } = useApp();
  const { thread, loading, offlineMode, bffUnavailable, send, context } = useSarthi();
  const [draft, setDraft] = useState('');
  const height = Dimensions.get('window').height * (showQuickLinks ? 0.52 : 0.4);

  const statusBanner = sarthiConnectionBanner({ offlineMode, bffUnavailable });
  const recent = useMemo(() => thread.messages.slice(-4), [thread.messages]);
  const monitorLine = context.corridorLabel
    ? `Monitoring ${context.corridorLabel} for fatigue zones and road hazards.`
    : 'Monitoring your route for fatigue zones and road hazards.';

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
      {statusBanner ? (
        <HudText variant="bodySm" style={styles.banner}>
          {statusBanner}
        </HudText>
      ) : null}
      {showQuickLinks ? (
        <View style={styles.quickBlock}>
          <HudText variant="bodySm" style={styles.monitorLine}>
            {monitorLine}
          </HudText>
          <SarthiQuickLink
            label="Road Safety Report"
            onPress={() => {
              onClose();
              router.push('/sarthi' as Href);
            }}
          />
          <SarthiQuickLink
            label="Emergency Contacts"
            onPress={() => {
              onClose();
              router.push('/emergency-contacts' as Href);
            }}
          />
          <SarthiQuickLink
            label="Nearby Hospitals"
            onPress={() => {
              if (!session.location) {
                Alert.alert(
                  'Location required',
                  'Capture your location in the emergency flow to find nearby hospitals.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Open locate',
                      onPress: () => router.push('/emergency/locate' as Href),
                    },
                  ]
                );
                return;
              }
              onClose();
              router.push('/emergency/route' as Href);
            }}
          />
        </View>
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
  quickBlock: {
    paddingHorizontal: tokens.spacing.gutter,
    paddingBottom: 8,
    gap: 6,
  },
  monitorLine: {
    color: tokens.onSurface,
    backgroundColor: tokens.surfaceContainer,
    padding: 8,
    borderRadius: tokens.radius.button,
    borderLeftWidth: 2,
    borderLeftColor: tokens.secondary,
    marginBottom: 4,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    borderRadius: tokens.radius.button,
    backgroundColor: tokens.surface,
  },
  quickLabel: { color: tokens.primary, fontFamily: 'PublicSans_600SemiBold' },
});
