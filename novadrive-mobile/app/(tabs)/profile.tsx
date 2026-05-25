import React, { useCallback } from 'react';
import { type Href, router } from 'expo-router';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { DashboardHeader } from '../../src/components/DashboardHeader';
import { GovSwitch } from '../../src/components/GovSwitch';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { LiveChip } from '../../src/components/LiveChip';
import { useApp } from '../../src/context/AppContext';
import { tokens } from '../../src/theme/tokens';

function ProfileMenuRow({
  icon,
  label,
  hint,
  onPress,
  chip,
  right,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  hint?: string;
  onPress?: () => void;
  chip?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !right}
      style={({ pressed }) => [rowStyles.row, pressed && onPress && rowStyles.pressed]}
    >
      <View style={rowStyles.iconWrap}>
        <MaterialIcons name={icon} size={20} color={tokens.primary} />
      </View>
      <View style={rowStyles.text}>
        <HudText variant="bodyMd" style={rowStyles.label}>
          {label}
        </HudText>
        {hint ? (
          <HudText variant="bodySm" style={rowStyles.hint}>
            {hint}
          </HudText>
        ) : null}
      </View>
      {chip}
      {right ?? (onPress ? <MaterialIcons name="chevron-right" size={22} color={tokens.outline} /> : null)}
    </Pressable>
  );
}

function SectionCard({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: 'primary' | 'secondary';
  children: React.ReactNode;
}) {
  return (
    <View style={sectionStyles.wrap}>
      <HudText variant="mono" style={sectionStyles.tag}>
        {title}
      </HudText>
      <HudCard accent={accent ?? 'none'} style={sectionStyles.card}>
        {children}
      </HudCard>
    </View>
  );
}

/**
 * Stitch `user_profile_safety_score` — Citizen User profile with safety score, vault links,
 * vehicle toggles, and sign-out.
 */
export default function ProfileTabScreen() {
  const { profile, settings, journeyStatus, voiceMonitoring, updateProfile, updateSettings, logout } =
    useApp();
  const displayName = profile.mode === 'auth' ? profile.name ?? 'Citizen User' : 'Citizen User';
  const citizenId = profile.citizenId ?? 'ND-2024-8832';
  const journeyLive = journeyStatus === 'ACTIVE';

  const pickAvatar = useCallback(async () => {
    try {
      const ImagePicker = await import('expo-image-picker');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Photo access needed',
          'Allow photo library access to set your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        await updateProfile({ avatarUri: result.assets[0].uri });
      }
    } catch {
      Alert.alert(
        'Photo picker unavailable',
        'Rebuild the app after updating, or use Expo Go for photo upload.'
      );
    }
  }, [updateProfile]);

  const confirmLogout = () => {
    Alert.alert('Sign out?', 'You will return to sign-in. Offline data stays on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth' as Href);
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <DashboardHeader />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.avatarStack}>
            <Pressable
              onPress={pickAvatar}
              style={({ pressed }) => [styles.avatarTouch, pressed && styles.avatarPressed]}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
            >
              <View style={styles.avatar}>
                {profile.avatarUri ? (
                  <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
                ) : (
                  <HudText variant="headlineMd" style={styles.avatarText}>
                    {displayName.slice(0, 1).toUpperCase()}
                  </HudText>
                )}
              </View>
            </Pressable>
            <Pressable
              onPress={pickAvatar}
              style={styles.avatarEdit}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
            >
              <MaterialIcons name="photo-camera" size={14} color={tokens.onSecondary} />
            </Pressable>
            <View style={styles.avatarBadge} accessible={false}>
              <MaterialIcons name="verified" size={14} color={tokens.onSecondary} />
            </View>
          </View>
          <HudText variant="bodySm" style={styles.avatarHint}>
            Tap photo to change
          </HudText>
          <HudText variant="headlineLg" style={styles.name}>
            {displayName}
          </HudText>
          <HudText variant="bodySm" style={styles.idLine}>
            ID: {citizenId}
          </HudText>
          <LiveChip label="Verified Profile" tone="safe" />
        </View>

        <HudCard accent="primary" style={styles.scoreCard}>
          <View style={styles.scoreInner}>
            <View style={{ flex: 1 }}>
              <HudText variant="mono" style={styles.scoreKicker}>
                PRIMARY SAFETY SCORE
              </HudText>
              <HudText variant="display" style={styles.scoreBig}>
                98.5
                <HudText variant="bodyMd" style={styles.scoreSmall}>
                  {' '}
                  / 100
                </HudText>
              </HudText>
            </View>
            <View style={styles.rankBox}>
              <HudText variant="mono" style={styles.rankLabel}>
                DISTRICT RANK
              </HudText>
              <HudText variant="headlineLg" style={styles.rankNum}>
                #1
              </HudText>
            </View>
          </View>
        </HudCard>

        <SectionCard title="IDENTITY & SAFETY">
          <ProfileMenuRow
            icon="badge"
            label="Aadhaar Verification"
            onPress={() =>
              Alert.alert('Aadhaar', 'Verification is active for this demo profile.')
            }
            chip={<LiveChip label="Active" tone="safe" />}
          />
          <View style={rowStyles.divider} />
          <ProfileMenuRow
            icon="military-tech"
            label="Safety Pioneer Status"
            onPress={() => Alert.alert('Safety Pioneer', 'You are in the top district tier for calm driving.')}
          />
        </SectionCard>

        <SectionCard title="EMERGENCY VAULT" accent="secondary">
          <ProfileMenuRow
            icon="medical-information"
            label="Medical Information"
            onPress={() => router.push('/medical?fromProfile=1' as Href)}
          />
          <View style={rowStyles.divider} />
          <ProfileMenuRow
            icon="contacts"
            label="Emergency Contacts"
            onPress={() => router.push('/emergency-contacts' as Href)}
          />
          <View style={rowStyles.divider} />
          <ProfileMenuRow
            icon="qr-code-2"
            label="Bystander QR Settings"
            onPress={() => router.push('/scan')}
          />
        </SectionCard>

        <SectionCard title="VEHICLE & DRIVE">
          <ProfileMenuRow
            icon="record-voice-over"
            label="Voice Crash Detection"
            hint={
              journeyLive && voiceMonitoring
                ? 'Listening during active journey'
                : 'Only while app is open and drive mode is active'
            }
            right={
              <GovSwitch
                value={settings.voiceCrashDetection ?? true}
                onValueChange={(v) => updateSettings({ voiceCrashDetection: v })}
                accessibilityLabel="Voice crash detection"
              />
            }
          />
          <View style={rowStyles.divider} />
          <ProfileMenuRow
            icon="sensors"
            label="Motion Sensor Calibration"
            onPress={() =>
              router.push({ pathname: '/journey/depart', params: { calibrateOnly: '1' } } as Href)
            }
          />
        </SectionCard>

        <SectionCard title="RECORDS">
          <ProfileMenuRow
            icon="history"
            label="Recent Trip History"
            onPress={() => router.push('/(tabs)/history' as Href)}
          />
          <View style={rowStyles.divider} />
          <ProfileMenuRow
            icon="assignment"
            label="Safety Reports"
            onPress={() => router.push('/(tabs)/history' as Href)}
          />
        </SectionCard>

        <SectionCard title="PREFERENCES">
          <ProfileMenuRow
            icon="settings"
            label="Configuration & Profiles"
            hint="Language · security · SOS"
            onPress={() => router.push('/settings' as Href)}
          />
          <View style={rowStyles.divider} />
          <ProfileMenuRow
            icon="accessibility-new"
            label="Accessibility"
            onPress={() => router.push('/accessibility?fromProfile=1' as Href)}
          />
        </SectionCard>

        <Pressable
          style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.9 }]}
          onPress={confirmLogout}
        >
          <MaterialIcons name="logout" size={20} color={tokens.primary} />
          <HudText variant="bodyMd" style={styles.signOutLabel}>
            Sign Out
          </HudText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  scroll: { padding: 20, paddingBottom: 120, gap: 4 },
  hero: { alignItems: 'center', marginBottom: 16, gap: 6 },
  avatarStack: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    overflow: 'visible',
  },
  avatarTouch: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: tokens.primaryFixed,
    borderWidth: 3,
    borderColor: tokens.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarPressed: { opacity: 0.92 },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: {
    color: tokens.primary,
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 32,
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: tokens.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: tokens.surface,
    zIndex: 3,
    elevation: 4,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: tokens.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: tokens.surface,
    zIndex: 3,
    elevation: 4,
  },
  avatarHint: { color: tokens.onSurfaceVariant, marginBottom: 4 },
  name: { color: tokens.primary, fontFamily: 'HankenGrotesk_700Bold' },
  idLine: { color: tokens.onSurfaceVariant },
  scoreCard: { marginBottom: 8 },
  scoreInner: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  scoreKicker: { fontSize: 10, color: tokens.onSurfaceVariant, letterSpacing: 1.2 },
  scoreBig: {
    color: tokens.primary,
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 36,
    lineHeight: 40,
  },
  scoreSmall: { color: tokens.onSurfaceVariant, fontSize: 16 },
  rankBox: {
    backgroundColor: tokens.primary,
    borderRadius: tokens.radius.card,
    padding: 12,
    alignItems: 'center',
    minWidth: 72,
  },
  rankLabel: { fontSize: 8, color: tokens.onPrimaryContainer, letterSpacing: 0.8 },
  rankNum: { color: tokens.onPrimary, fontFamily: 'HankenGrotesk_800ExtraBold' },
  signOut: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: tokens.radius.button,
    borderWidth: 1.5,
    borderColor: tokens.primary,
    backgroundColor: tokens.surface,
  },
  signOutLabel: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
});

const sectionStyles = StyleSheet.create({
  wrap: { marginTop: 12 },
  tag: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: tokens.onSurfaceVariant,
    marginBottom: 6,
    marginLeft: 4,
  },
  card: { paddingVertical: 4, paddingHorizontal: 0 },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  pressed: { backgroundColor: tokens.surfaceContainerLow },
  divider: { height: 1, backgroundColor: tokens.outlineVariant, marginLeft: 56 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.iconWrap,
    backgroundColor: tokens.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  label: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  hint: { color: tokens.onSurfaceVariant, marginTop: 2 },
});
