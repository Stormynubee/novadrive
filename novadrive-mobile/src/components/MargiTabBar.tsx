import { type Href, router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from './HudText';
import { tokens } from '../theme/tokens';

type TabKey = 'drive' | 'explore' | 'history' | 'profile';

const TABS: {
  key: TabKey;
  href: Href;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
}[] = [
  { key: 'explore', href: '/(tabs)/explore' as Href, icon: 'home', label: 'Home' },
  { key: 'drive', href: '/(tabs)/drive' as Href, icon: 'directions-car', label: 'Trip' },
  { key: 'history', href: '/(tabs)/history' as Href, icon: 'groups', label: 'Community' },
  { key: 'profile', href: '/(tabs)/profile' as Href, icon: 'person', label: 'Profile' },
];

export function MargiTabBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (key: TabKey) => {
    if (key === 'drive') return pathname.includes('drive');
    if (key === 'explore') return pathname.includes('explore');
    if (key === 'history') return pathname.includes('history');
    return pathname.includes('profile');
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {TABS.map((tab) => {
        const active = isActive(tab.key);
        return (
          <Pressable
            key={tab.key}
            onPress={() => router.replace(tab.href)}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={active ? { selected: true } : undefined}
          >
            <View style={[styles.pill, active && styles.pillActive]}>
              <MaterialIcons
                name={tab.icon}
                size={22}
                color={active ? tokens.onSecondary : tokens.primary}
              />
            </View>
            <HudText variant="mono" style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {tab.label}
            </HudText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: tokens.surface,
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: tokens.outlineVariant,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 4, gap: 4 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 999,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: tokens.secondary },
  label: {
    fontSize: 10,
    color: tokens.onSurfaceVariant,
    letterSpacing: 0.4,
  },
  labelActive: { color: tokens.secondary, fontFamily: 'PublicSans_700Bold' },
});
