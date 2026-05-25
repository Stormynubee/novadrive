import { type Href, router } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HudText } from './HudText';
import { NovaButton } from './NovaButton';
import { tokens } from '../theme/tokens';

export type QuickMenuItem = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  hint?: string;
  href?: Href;
  onPress?: () => void;
  accent?: 'default' | 'urgent';
};

const DEFAULT_ITEMS: QuickMenuItem[] = [
  {
    icon: 'home',
    label: 'Home dashboard',
    hint: 'Safety score & quick actions',
    href: '/(tabs)/explore' as Href,
  },
  {
    icon: 'person',
    label: 'My profile',
    hint: 'Identity, vault & preferences',
    href: '/(tabs)/profile' as Href,
  },
  {
    icon: 'settings',
    label: 'Settings',
    hint: 'Language, SOS & security',
    href: '/settings' as Href,
  },
  {
    icon: 'accessibility-new',
    label: 'Accessibility',
    hint: 'Text size & motion',
    href: '/accessibility?fromProfile=1' as Href,
  },
  {
    icon: 'medical-information',
    label: 'Medical profile',
    hint: 'Emergency vault',
    href: '/medical?fromProfile=1' as Href,
  },
  {
    icon: 'contacts',
    label: 'Emergency contacts',
    hint: 'Family & ICE',
    href: '/emergency-contacts' as Href,
  },
];

function MenuRow({
  icon,
  label,
  hint,
  accent = 'default',
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  hint?: string;
  accent?: 'default' | 'urgent';
  onPress: () => void;
}) {
  const urgent = accent === 'urgent';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.rowIcon, urgent && styles.rowIconUrgent]}>
        <MaterialIcons name={icon} size={22} color={urgent ? tokens.secondary : tokens.primary} />
      </View>
      <View style={styles.rowText}>
        <HudText variant="bodyMd" style={styles.rowLabel}>
          {label}
        </HudText>
        {hint ? (
          <HudText variant="bodySm" style={styles.rowHint}>
            {hint}
          </HudText>
        ) : null}
      </View>
      <MaterialIcons name="chevron-right" size={22} color={tokens.outline} />
    </Pressable>
  );
}

/**
 * GovTech slide-out quick menu — replaces native Alert for hamburger navigation.
 */
export function NovaQuickMenuSheet({
  visible,
  onClose,
  items = DEFAULT_ITEMS,
}: {
  visible: boolean;
  onClose: () => void;
  items?: QuickMenuItem[];
}) {
  const insets = useSafeAreaInsets();

  const go = (item: QuickMenuItem) => {
    onClose();
    if (item.onPress) {
      item.onPress();
      return;
    }
    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <View
          style={[styles.drawer, { paddingBottom: Math.max(insets.bottom, 16) }]}
          accessibilityViewIsModal
        >
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.headerBtn, pressed && styles.headerBtnPressed]}
              accessibilityRole="button"
              accessibilityLabel="Back and close menu"
            >
              <MaterialIcons name="arrow-back" size={24} color={tokens.onPrimary} />
            </Pressable>
            <View style={styles.headerTitles}>
              <HudText variant="mono" style={styles.headerKicker}>
                NOVA DRIVE
              </HudText>
              <HudText variant="headlineMd" style={styles.headerTitle}>
                Quick links
              </HudText>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.headerBtn, pressed && styles.headerBtnPressed]}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
            >
              <MaterialIcons name="close" size={24} color={tokens.onPrimary} />
            </Pressable>
          </View>

          <HudText variant="bodySm" style={styles.headerSub}>
            Jump to settings, vault, and profile. Tap outside or use back to close.
          </HudText>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            <HudText variant="mono" style={styles.sectionTag}>
              NAVIGATION
            </HudText>
            <View style={styles.card}>
              {items.map((item, index) => (
                <View key={item.label}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <MenuRow
                    icon={item.icon}
                    label={item.label}
                    hint={item.hint}
                    accent={item.accent}
                    onPress={() => go(item)}
                  />
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <NovaButton
              label="Back"
              onPress={onClose}
              variant="primary"
              large
              style={styles.backBtn}
            />
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeLink, pressed && styles.closeLinkPressed]}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
            >
              <MaterialIcons name="close" size={18} color={tokens.primary} />
              <HudText variant="bodyMd" style={styles.closeLinkText}>
                Close
              </HudText>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
        />
      </View>
    </Modal>
  );
}

const DRAWER_WIDTH = 300;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,10,30,0.48)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    maxWidth: '88%',
    backgroundColor: tokens.background,
    borderRightWidth: 1,
    borderRightColor: tokens.outlineVariant,
    ...tokens.elevation.floating,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: tokens.primary,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.iconWrap,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnPressed: { backgroundColor: 'rgba(255,255,255,0.12)' },
  headerTitles: { flex: 1, minWidth: 0 },
  headerKicker: {
    fontSize: 9,
    letterSpacing: 1.4,
    color: tokens.onPrimaryContainer,
  },
  headerTitle: {
    color: tokens.onPrimary,
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 18,
    lineHeight: 22,
  },
  headerSub: {
    color: tokens.onSurfaceVariant,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    lineHeight: 20,
  },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 12, paddingBottom: 12 },
  sectionTag: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: tokens.onSurfaceVariant,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    overflow: 'hidden',
    ...tokens.elevation.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  rowPressed: { backgroundColor: tokens.surfaceContainerLow },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.iconWrap,
    backgroundColor: tokens.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconUrgent: {
    backgroundColor: tokens.secondaryFixed,
  },
  rowText: { flex: 1, minWidth: 0 },
  rowLabel: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  rowHint: { color: tokens.onSurfaceVariant, marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: tokens.outlineVariant,
    marginLeft: 66,
  },
  footer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: tokens.outlineVariant,
    backgroundColor: tokens.surface,
  },
  backBtn: { width: '100%' },
  closeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  closeLinkPressed: { opacity: 0.85 },
  closeLinkText: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
});
