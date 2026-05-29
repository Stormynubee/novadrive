import React from 'react';
import { type Href, router } from 'expo-router';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { GovSwitch } from '../src/components/GovSwitch';
import { HudCard } from '../src/components/HudCard';
import { HudText } from '../src/components/HudText';
import { MargiTopBar } from '../src/components/MargiTopBar';
import { useApp } from '../src/context/AppContext';
import type { Lang, SosSensitivity } from '../src/lib/types';
import { announceA11y } from '../src/lib/a11yRuntime';
import { TEAM_DISPLAY_NAME } from '../src/lib/brand';
import { tokens } from '../src/theme/tokens';

const LANGUAGES: { key: Lang; label: string }[] = [
  { key: 'en', label: 'English (Official)' },
  { key: 'hi', label: 'Hindi' },
  { key: 'ta', label: 'Tamil' },
];

const SOS_LEVELS: SosSensitivity[] = ['low', 'medium', 'high'];

function SettingsSection({
  icon,
  title,
  accent = 'primary',
  children,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  accent?: 'primary' | 'secondary';
  children: React.ReactNode;
}) {
  const accentColor = accent === 'secondary' ? tokens.secondary : tokens.primary;
  const iconBg = accent === 'secondary' ? tokens.secondaryFixed : tokens.primaryFixed;
  return (
    <HudCard accent={accent}>
      <View style={sectionStyles.head}>
        <View style={[sectionStyles.iconWrap, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon} size={20} color={accentColor} />
        </View>
        <HudText variant="headlineMd" style={[sectionStyles.title, { color: accentColor }]}>
          {title}
        </HudText>
      </View>
      {children}
    </HudCard>
  );
}

function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable style={checkStyles.row} onPress={onToggle}>
      <View style={[checkStyles.box, checked && checkStyles.boxOn]}>
        {checked ? <MaterialIcons name="check" size={16} color={tokens.onSecondary} /> : null}
      </View>
      <HudText variant="bodyMd" style={checkStyles.label}>
        {label}
      </HudText>
    </Pressable>
  );
}

/**
 * Stitch `nova_drive_professional_settings_customization` — Configuration & Profiles.
 */
export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, settings, updateSettings, a11y } = useApp();
  const citizenId = profile.citizenId ?? 'ND-2024-8832';

  return (
    <View style={styles.root}>
      <MargiTopBar
        title={`ID: #${citizenId.replace('ND-', '')}`}
        subtitle="Configuration"
        showBack
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <HudText variant="headlineLg" style={styles.pageTitle}>
          Configuration & Profiles
        </HudText>
        <HudText variant="bodyMd" style={styles.pageSub}>
          Manage institutional protocols and application parameters.
        </HudText>

        <SettingsSection icon="language" title="Regional & Language">
          <HudText variant="mono" style={styles.fieldLabel}>
            Primary language
          </HudText>
          <View style={styles.langRow}>
            {LANGUAGES.map((lang) => {
              const active = settings.language === lang.key;
              return (
                <Pressable
                  key={lang.key}
                  onPress={() => updateSettings({ language: lang.key })}
                  style={[styles.langChip, active && styles.langChipOn]}
                >
                  <HudText variant="bodySm" style={active ? styles.langOn : styles.langOff}>
                    {lang.label}
                  </HudText>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <HudText variant="bodyMd" style={styles.toggleTitle}>
                Regional configuration
              </HudText>
              <HudText variant="bodySm" style={styles.toggleHint}>
                Apply localized safety protocols
              </HudText>
            </View>
            <GovSwitch
              value={settings.regionalProtocols}
              onValueChange={(v) => updateSettings({ regionalProtocols: v })}
              accessibilityLabel="Regional configuration"
            />
          </View>
        </SettingsSection>

        <SettingsSection icon="shield" title="Account & Security">
          <View style={styles.toggleRow}>
            <MaterialIcons name="fingerprint" size={22} color={tokens.primary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <HudText variant="bodyMd" style={styles.toggleTitle}>
                Biometric authentication
              </HudText>
              <HudText variant="bodySm" style={styles.toggleHint}>
                Require biometrics for app access
              </HudText>
            </View>
            <GovSwitch
              value={settings.biometricAuth}
              onValueChange={(v) => {
                updateSettings({ biometricAuth: v });
                if (v) {
                  Alert.alert(
                    'Biometric login',
                    'On device builds, this will gate app open. Demo mode stores your preference only.'
                  );
                }
              }}
              accessibilityLabel="Biometric authentication"
            />
          </View>
          <View style={[styles.toggleRow, { marginTop: 14 }]}>
            <MaterialIcons name="verified-user" size={22} color={tokens.tertiary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <HudText variant="bodyMd" style={styles.toggleTitle}>
                Official ID status
              </HudText>
              <HudText variant="bodySm" style={{ color: tokens.tertiary, fontFamily: 'PublicSans_700Bold' }}>
                Verified — Level 2
              </HudText>
            </View>
            <Pressable
              style={styles.updateBtn}
              onPress={() =>
                Alert.alert('Update ID', 'Link your Aadhaar in a future release. Guest mode is active for this demo.')
              }
            >
              <HudText variant="mono" style={styles.updateLabel}>
                Update
              </HudText>
            </Pressable>
          </View>
        </SettingsSection>

        <SettingsSection icon="emergency" title="Safety Customization" accent="secondary">
          <HudText variant="mono" style={styles.fieldLabel}>
            Auto-SOS sensitivity
          </HudText>
          <HudText variant="headlineMd" style={styles.sosValue}>
            {settings.sosSensitivity.charAt(0).toUpperCase() + settings.sosSensitivity.slice(1)}
          </HudText>
          <View style={styles.sosRow}>
            {SOS_LEVELS.map((level) => {
              const active = settings.sosSensitivity === level;
              return (
                <Pressable
                  key={level}
                  onPress={() => updateSettings({ sosSensitivity: level })}
                  style={[styles.sosChip, active && styles.sosChipOn]}
                >
                  <HudText variant="mono" style={active ? styles.sosChipOnText : styles.sosChipText}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </HudText>
                </Pressable>
              );
            })}
          </View>
          <View style={[styles.toggleRow, { marginTop: 16 }]}>
            <View style={{ flex: 1 }}>
              <HudText variant="bodyMd" style={styles.toggleTitle}>
                Real-time telemetry sharing
              </HudText>
              <HudText variant="bodySm" style={styles.toggleHint}>
                Transmit data to control centers
              </HudText>
            </View>
            <GovSwitch
              value={settings.telemetrySharing}
              onValueChange={(v) => updateSettings({ telemetrySharing: v })}
              accessibilityLabel="Telemetry sharing"
            />
          </View>
          <HudText variant="bodyMd" style={[styles.toggleTitle, { marginTop: 18 }]}>
            Golden Hour protocol defaults
          </HudText>
          <HudText variant="bodySm" style={[styles.toggleHint, { marginBottom: 10 }]}>
            Configure automatic actions triggered during severe incidents.
          </HudText>
          <CheckRow
            label="Auto-dispatch Medical Services"
            checked={settings.autoDispatchMedical}
            onToggle={() => updateSettings({ autoDispatchMedical: !settings.autoDispatchMedical })}
          />
          <CheckRow
            label="Notify Emergency Contacts"
            checked={settings.notifyEmergencyContacts}
            onToggle={() =>
              updateSettings({ notifyEmergencyContacts: !settings.notifyEmergencyContacts })
            }
          />
          <CheckRow
            label="Lock Device Screen"
            checked={settings.lockDeviceScreen}
            onToggle={() => updateSettings({ lockDeviceScreen: !settings.lockDeviceScreen })}
          />
        </SettingsSection>

        <Pressable
          style={styles.linkRow}
          onPress={() => router.push('/accessibility?fromSettings=1' as Href)}
        >
          <MaterialIcons name="accessibility-new" size={22} color={tokens.primary} />
          <HudText variant="bodyMd" style={styles.linkLabel}>
            Accessibility features
          </HudText>
          <MaterialIcons name="chevron-right" size={22} color={tokens.outline} />
        </Pressable>

        <View style={styles.footer}>
          <MaterialIcons name="shield" size={28} color={tokens.outline} />
          <HudText variant="mono" style={styles.footerBrand}>
            Powered by {TEAM_DISPLAY_NAME}
          </HudText>
          <HudText variant="bodySm" style={styles.footerVer}>
            Version 2.4.1 (Gov Edition)
          </HudText>
          <View style={styles.footerLinks}>
            <Pressable onPress={() => Linking.openURL('https://www.meity.gov.in/')}>
              <HudText variant="bodySm" style={styles.footerLink}>
                Privacy Policy
              </HudText>
            </Pressable>
            <Pressable onPress={() => Linking.openURL('https://www.meity.gov.in/')}>
              <HudText variant="bodySm" style={styles.footerLink}>
                Terms of Service
              </HudText>
            </Pressable>
            <Pressable
              onPress={() => {
                announceA11y('Audit logs are stored locally on this device.', a11y);
                Alert.alert('Audit logs', 'Local journey and feedback logs are on this device only.');
              }}
            >
              <HudText variant="bodySm" style={styles.footerLink}>
                Audit Logs
              </HudText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.iconWrap,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: 'PublicSans_700Bold' },
});

const checkStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: tokens.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: tokens.secondary, borderColor: tokens.secondary },
  label: { color: tokens.onSurface, flex: 1 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  scroll: { padding: 20, gap: 16 },
  pageTitle: { color: tokens.primary, marginTop: 4 },
  pageSub: { color: tokens.onSurfaceVariant, lineHeight: 24 },
  fieldLabel: { fontSize: 11, color: tokens.onSurfaceVariant, marginBottom: 8 },
  langRow: { gap: 8, marginBottom: 14 },
  langChip: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: tokens.radius.input,
    borderWidth: 1.5,
    borderColor: tokens.primary,
    backgroundColor: tokens.surface,
  },
  langChipOn: { backgroundColor: tokens.primary },
  langOff: { color: tokens.primary },
  langOn: { color: tokens.onPrimary, fontFamily: 'PublicSans_700Bold' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleTitle: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  toggleHint: { color: tokens.onSurfaceVariant, marginTop: 2 },
  updateBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: tokens.radius.button,
    borderWidth: 1.5,
    borderColor: tokens.primary,
  },
  updateLabel: { color: tokens.primary, fontSize: 11 },
  sosValue: { color: tokens.secondary, marginBottom: 4 },
  sosRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  sosChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: tokens.radius.input,
    borderWidth: 1.5,
    borderColor: tokens.secondary,
    alignItems: 'center',
  },
  sosChipOn: { backgroundColor: tokens.secondary },
  sosChipText: { color: tokens.secondary, fontSize: 11 },
  sosChipOnText: { color: tokens.onSecondary, fontSize: 11, fontFamily: 'PublicSans_700Bold' },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
  },
  linkLabel: { flex: 1, color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  footer: { alignItems: 'center', gap: 6, marginTop: 24, paddingTop: 16 },
  footerBrand: { color: tokens.onSurfaceVariant, letterSpacing: 1.2, fontSize: 10 },
  footerVer: { color: tokens.outline },
  footerLinks: { flexDirection: 'row', gap: 16, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' },
  footerLink: { color: tokens.onSurfaceVariant, textDecorationLine: 'underline' },
});
