import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { HudCard } from '../src/components/HudCard';
import { HudText } from '../src/components/HudText';
import { MargiButton } from '../src/components/MargiButton';
import { MargiInput } from '../src/components/MargiInput';
import { MargiTopBar } from '../src/components/MargiTopBar';
import { useApp } from '../src/context/AppContext';
import type { EmergencyContact } from '../src/lib/types';
import {
  defaultEmergencyContact,
  defaultMedical,
  formatIceLine,
  normalizeMedical,
} from '../src/lib/storage';
import { tokens } from '../src/theme/tokens';

const MAX_ICE = 5; // ICE 1 (primary) + ICE 2–5 (extras)

const ICE_LABELS: Record<number, string> = {
  1: 'Primary Contact (ICE 1)',
  2: 'ICE 2 — Backup Contact',
  3: 'ICE 3 — Tertiary Contact',
  4: 'ICE 4',
  5: 'ICE 5',
};

/** Single ICE contact form card */
function IceContactCard({
  index,
  contact,
  onChange,
  onDelete,
  canDelete,
}: {
  index: number; // 1-based ICE number
  contact: EmergencyContact;
  onChange: (c: EmergencyContact) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  return (
    <HudCard style={styles.card}>
      <View style={styles.cardHead}>
        {/* ICE badge */}
        <View style={styles.iceBadge}>
          <HudText variant="mono" style={styles.iceBadgeText}>
            ICE {index}
          </HudText>
        </View>
        <HudText variant="bodyMd" style={styles.iceTitle}>
          {ICE_LABELS[index] ?? `ICE ${index}`}
        </HudText>
        {canDelete && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
              onDelete();
            }}
            style={styles.deleteBtn}
            accessibilityLabel={`Remove ICE ${index}`}
          >
            <MaterialIcons name="delete-outline" size={22} color={tokens.outline} />
          </Pressable>
        )}
      </View>

      <HudText variant="mono" style={styles.label}>Full Name</HudText>
      <MargiInput
        value={contact.fullName}
        onChangeText={(t) => onChange({ ...contact, fullName: t })}
        placeholder="e.g. Sarah Jenkins"
      />

      <HudText variant="mono" style={styles.label}>Relationship</HudText>
      <MargiInput
        value={contact.relationship}
        onChangeText={(t) => onChange({ ...contact, relationship: t })}
        placeholder="e.g. Spouse, Parent, Sibling"
      />

      <HudText variant="mono" style={styles.label}>Phone Number</HudText>
      <MargiInput
        value={contact.phone}
        onChangeText={(t) => onChange({ ...contact, phone: t })}
        placeholder="+91 98765 43210"
        keyboardType="phone-pad"
      />
    </HudCard>
  );
}

/** Emergency Contacts screen — supports ICE 1 through ICE 5 */
export default function EmergencyContactsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateMedical } = useApp();
  const userEdited = useRef(false);

  // ICE 1 — primary contact
  const [primary, setPrimary] = useState<EmergencyContact>(() => {
    const m = normalizeMedical({ ...defaultMedical(), ...profile.medical });
    return m.primaryContact ?? defaultEmergencyContact();
  });

  // ICE 2–5 — extra contacts (stored as array, max 4)
  const [extras, setExtras] = useState<EmergencyContact[]>(() => {
    const m = normalizeMedical({ ...defaultMedical(), ...profile.medical });
    return m.iceContacts ?? [];
  });

  useEffect(() => {
    if (userEdited.current || !profile.medical) return;
    const m = normalizeMedical(profile.medical);
    setPrimary(m.primaryContact ?? defaultEmergencyContact());
    setExtras(m.iceContacts ?? []);
  }, [profile.medical]);

  const totalContacts = 1 + extras.length; // ICE 1 + extras
  const canAddMore = totalContacts < MAX_ICE;

  const addContact = () => {
    if (!canAddMore) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    userEdited.current = true;
    setExtras((prev) => [...prev, defaultEmergencyContact()]);
  };

  const updateExtra = (i: number, c: EmergencyContact) => {
    userEdited.current = true;
    setExtras((prev) => prev.map((x, idx) => (idx === i ? c : x)));
  };

  const deleteExtra = (i: number) => {
    userEdited.current = true;
    setExtras((prev) => prev.filter((_, idx) => idx !== i));
  };

  const save = async () => {
    if (!primary.fullName.trim() || !primary.phone.trim()) {
      Alert.alert('Required fields', 'Enter the full name and phone number for your primary contact (ICE 1).');
      return;
    }
    const m = normalizeMedical({
      ...defaultMedical(),
      ...profile.medical,
      primaryContact: primary,
      emergencyContact: formatIceLine(primary),
      iceContacts: extras,
    });
    userEdited.current = true;
    await updateMedical(m);
    router.back();
  };

  return (
    <View style={styles.root}>
      <MargiTopBar title="EMERGENCY CONTACTS" subtitle="Family & ICE" showBack />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section header */}
        <View style={styles.headerRow}>
          <MaterialIcons name="contact-emergency" size={24} color={tokens.primary} />
          <HudText variant="headlineMd" style={styles.title}>
            Emergency Contacts
          </HudText>
          {/* Contact count badge */}
          <View style={styles.countBadge}>
            <HudText variant="mono" style={styles.countText}>
              {totalContacts}/{MAX_ICE}
            </HudText>
          </View>
        </View>

        <HudText variant="bodySm" style={styles.subtitle}>
          In Case of Emergency contacts are notified automatically when SOS is triggered.
        </HudText>

        {/* ICE 1 — always shown, cannot be deleted */}
        <IceContactCard
          index={1}
          contact={primary}
          onChange={(c) => {
            userEdited.current = true;
            setPrimary(c);
          }}
          onDelete={() => {/* primary cannot be deleted */}}
          canDelete={false}
        />

        {/* ICE 2–5 — dynamically added extras */}
        {extras.map((c, i) => (
          <IceContactCard
            key={i}
            index={i + 2}
            contact={c}
            onChange={(updated) => updateExtra(i, updated)}
            onDelete={() => deleteExtra(i)}
            canDelete
          />
        ))}

        {/* Add contact button — hidden when at ICE 5 */}
        {canAddMore && (
          <Pressable
            onPress={addContact}
            style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Add emergency contact"
          >
            <View style={styles.addIconCircle}>
              <MaterialIcons name="add" size={22} color={tokens.onPrimary} />
            </View>
            <View style={styles.addTextBlock}>
              <HudText variant="mono" style={styles.addLabel}>
                Add ICE {totalContacts + 1}
              </HudText>
              <HudText variant="bodySm" style={styles.addSub}>
                {MAX_ICE - totalContacts} slot{MAX_ICE - totalContacts !== 1 ? 's' : ''} remaining
              </HudText>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={tokens.onSurfaceVariant} />
          </Pressable>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <MargiButton label="Cancel" variant="ghost" onPress={() => router.back()} style={{ flex: 1 }} />
          <MargiButton label="Save & continue" onPress={save} large style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  scroll: { padding: 20, gap: 14 },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { flex: 1, color: tokens.primary, fontFamily: 'PublicSans_700Bold' },

  countBadge: {
    backgroundColor: tokens.primaryFixed,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: tokens.primaryContainer,
  },
  countText: {
    fontSize: 10,
    color: tokens.primary,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 0.4,
  },

  subtitle: {
    color: tokens.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 4,
  },

  card: { gap: 0 },

  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  iceBadge: {
    backgroundColor: tokens.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  iceBadgeText: {
    fontSize: 9,
    color: tokens.onPrimary,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 0.8,
  },
  iceTitle: {
    flex: 1,
    color: tokens.primary,
    fontFamily: 'PublicSans_700Bold',
  },
  deleteBtn: {
    padding: 4,
  },

  label: { color: tokens.primary, fontSize: 11, marginTop: 10, marginBottom: 4 },

  /* Add contact button */
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    borderWidth: 1.5,
    borderColor: tokens.primary,
    borderStyle: 'dashed',
    padding: 16,
  },
  addBtnPressed: {
    backgroundColor: tokens.primaryFixed,
  },
  addIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTextBlock: { flex: 1 },
  addLabel: {
    color: tokens.primary,
    fontSize: 13,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 0.3,
  },
  addSub: {
    color: tokens.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },

  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
