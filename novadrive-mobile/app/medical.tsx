import { type Href, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { HudCard } from '../src/components/HudCard';
import { HudText } from '../src/components/HudText';
import { NovaButton } from '../src/components/NovaButton';
import { NovaInput } from '../src/components/NovaInput';
import { NovaTopBar } from '../src/components/NovaTopBar';
import { OnboardingShell } from '../src/components/OnboardingShell';
import { useApp } from '../src/context/AppContext';
import type { EmergencyContact, MedicalProfile } from '../src/lib/types';
import {
  defaultEmergencyContact,
  defaultMedical,
  formatIceLine,
  normalizeMedical,
} from '../src/lib/storage';
import { tokens } from '../src/theme/tokens';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

function EmergencyContactCard({
  contact,
  onChange,
  onClear,
}: {
  contact: EmergencyContact;
  onChange: (c: EmergencyContact) => void;
  onClear: () => void;
}) {
  return (
    <View style={contactStyles.wrap}>
      <View style={contactStyles.head}>
        <HudText variant="bodyMd" style={contactStyles.iceLabel}>
          Primary Contact (ICE 1)
        </HudText>
        <Pressable onPress={onClear} accessibilityLabel="Clear contact">
          <MaterialIcons name="delete-outline" size={22} color={tokens.outline} />
        </Pressable>
      </View>
      <HudText variant="mono" style={contactStyles.fieldLabel}>
        Full Name
      </HudText>
      <NovaInput
        value={contact.fullName}
        onChangeText={(t) => onChange({ ...contact, fullName: t })}
        placeholder="e.g. Sarah Jenkins"
      />
      <HudText variant="mono" style={contactStyles.fieldLabel}>
        Relationship
      </HudText>
      <NovaInput
        value={contact.relationship}
        onChangeText={(t) => onChange({ ...contact, relationship: t })}
        placeholder="e.g. Spouse, Parent, Sibling"
      />
      <HudText variant="mono" style={contactStyles.fieldLabel}>
        Phone Number
      </HudText>
      <NovaInput
        value={contact.phone}
        onChangeText={(t) => onChange({ ...contact, phone: t })}
        placeholder="+91 98765 43210"
        keyboardType="phone-pad"
      />
    </View>
  );
}

/**
 * Stitch `nova_drive_refined_medical_profile_no_nav` — blood group, allergies, conditions,
 * medications, and structured Primary Contact (ICE 1) for family emergency reach-out.
 */
export default function MedicalScreen() {
  const { fromProfile } = useLocalSearchParams<{ fromProfile?: string }>();
  const inProfile = fromProfile === '1';
  const insets = useSafeAreaInsets();
  const { profile, updateMedical } = useApp();
  const [m, setM] = useState(() => normalizeMedical({ ...defaultMedical(), ...profile.medical }));
  const userEdited = useRef(false);

  useEffect(() => {
    if (userEdited.current || !profile.medical) return;
    setM(normalizeMedical(profile.medical));
  }, [profile.medical]);

  const updateField = <K extends keyof MedicalProfile>(key: K, value: MedicalProfile[K]) => {
    userEdited.current = true;
    setM((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    const ice = m.primaryContact ?? defaultEmergencyContact();
    if (!ice.fullName.trim() || !ice.phone.trim()) {
      Alert.alert(
        'Emergency contact',
        'Add your primary family contact name and phone so responders can reach them.'
      );
      return;
    }
    const payload = normalizeMedical({
      ...m,
      primaryContact: ice,
      emergencyContact: formatIceLine(ice),
    });
    await updateMedical(payload);
    if (inProfile) {
      router.back();
    } else {
      router.push('/accessibility');
    }
  };

  const body = (
    <>
      <HudCard>
        <View style={styles.sectionHead}>
          <MaterialIcons name="bloodtype" size={22} color={tokens.error} />
          <HudText variant="headlineMd" style={styles.sectionTitle}>
            Blood group
          </HudText>
        </View>
        <View style={styles.bloodGrid}>
          {BLOOD_TYPES.map((bt) => {
            const active = m.bloodType === bt;
            return (
              <Pressable
                key={bt}
                onPress={() => updateField('bloodType', bt)}
                style={[styles.bloodChip, active && styles.bloodChipActive]}
              >
                <HudText
                  variant="bodyMd"
                  style={[styles.bloodLabel, active && styles.bloodLabelActive]}
                >
                  {bt}
                </HudText>
              </Pressable>
            );
          })}
        </View>
      </HudCard>

      <HudCard>
        <HudText variant="mono" style={styles.label}>
          Known allergies
        </HudText>
        <NovaInput
          placeholder="e.g. Penicillin, peanuts"
          value={m.allergies ?? ''}
          onChangeText={(t) => updateField('allergies', t)}
          multiline
        />
      </HudCard>

      <HudCard>
        <HudText variant="mono" style={styles.label}>
          Chronic medical conditions
        </HudText>
        <NovaInput
          placeholder="e.g. Type 2 diabetes, asthma"
          value={m.conditions ?? ''}
          onChangeText={(t) => updateField('conditions', t)}
          multiline
        />
      </HudCard>

      <HudCard>
        <HudText variant="mono" style={styles.label}>
          Current medications
        </HudText>
        <NovaInput
          placeholder="List ongoing prescriptions…"
          value={m.medications ?? ''}
          onChangeText={(t) => updateField('medications', t)}
          multiline
        />
      </HudCard>

      <HudCard accent="primary">
        <View style={styles.iceHeader}>
          <View style={styles.sectionHead}>
            <MaterialIcons name="contact-emergency" size={22} color={tokens.primary} />
            <HudText variant="headlineMd" style={styles.sectionTitle}>
              Emergency Contacts
            </HudText>
          </View>
        </View>
        <EmergencyContactCard
          contact={m.primaryContact ?? defaultEmergencyContact()}
          onChange={(c) => updateField('primaryContact', c)}
          onClear={() => updateField('primaryContact', defaultEmergencyContact())}
        />
      </HudCard>

      <View style={styles.actions}>
        <NovaButton
          label="Cancel"
          variant="ghost"
          onPress={() => (inProfile ? router.back() : router.replace('/auth' as Href))}
          style={{ flex: 1 }}
        />
        <NovaButton
          label={inProfile ? 'Save & continue' : 'Save & continue'}
          onPress={save}
          large
          style={{ flex: 1 }}
        />
      </View>
    </>
  );

  if (!inProfile) {
    return (
      <OnboardingShell
        step={2}
        total={3}
        title="Medical profile"
        subtitle="Used for the Golden Hour Packet only when you consent. Stored encrypted on this device."
      >
        {body}
      </OnboardingShell>
    );
  }

  return (
    <View style={styles.root}>
      <NovaTopBar title="MEDICAL PROFILE" subtitle="Emergency vault" showBack />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {body}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  scroll: { padding: 20, gap: 14 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  label: { color: tokens.primary, fontSize: 12, marginBottom: 8 },
  bloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bloodChip: {
    minWidth: 64,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: tokens.radius.input,
    borderWidth: 1.5,
    borderColor: tokens.primary,
    alignItems: 'center',
    backgroundColor: tokens.surface,
  },
  bloodChipActive: { backgroundColor: tokens.primary },
  bloodLabel: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  bloodLabelActive: { color: tokens.onPrimary },
  iceHeader: { marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});

const contactStyles = StyleSheet.create({
  wrap: {
    backgroundColor: tokens.surfaceContainerLow,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    padding: 14,
    gap: 4,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iceLabel: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  fieldLabel: { color: tokens.primary, fontSize: 11, marginTop: 8, marginBottom: 4 },
});
