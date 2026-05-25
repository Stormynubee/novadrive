import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { HudText } from './HudText';
import { NovaTopBar } from './NovaTopBar';
import { tokens } from '../theme/tokens';

export function ScreenShell({
  title,
  subtitle,
  children,
  hudBar,
  showBack,
  noScroll,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  hudBar?: boolean;
  showBack?: boolean;
  noScroll?: boolean;
}) {
  const { a11y } = useApp();
  const heading = !hudBar && title ? (
    <View style={styles.heading}>
      <HudText variant="headlineLg" style={{ color: tokens.primary }}>
        {title}
      </HudText>
      {subtitle ? (
        <HudText variant="bodyMd" style={styles.sub}>
          {subtitle}
        </HudText>
      ) : null}
    </View>
  ) : null;

  const inner = (
    <>
      {heading}
      <View style={styles.body}>{children}</View>
    </>
  );

  return (
    <SafeAreaView
      style={[styles.safe, a11y.highContrast && styles.highContrast]}
      edges={hudBar ? [] : ['top']}
    >
      {hudBar ? <NovaTopBar title={title ?? 'NOVA DRIVE'} subtitle={subtitle} showBack={showBack} /> : null}
      {noScroll ? (
        <View style={styles.scroll}>{inner}</View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.background },
  highContrast: { backgroundColor: '#ffffff' },
  scroll: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  heading: { marginBottom: 12 },
  sub: { marginTop: 6, color: tokens.onSurfaceVariant, lineHeight: 22 },
  body: { gap: 14 },
});
