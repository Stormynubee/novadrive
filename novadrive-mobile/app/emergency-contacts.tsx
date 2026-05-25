import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { HudCard } from '../src/components/HudCard';
import { HudText } from '../src/components/HudText';
import { NovaButton } from '../src/components/NovaButton';
import { NovaInput } from '../src/components/NovaInput';
import { NovaTopBar } from '../src/components/NovaTopBar';
import { useApp } from '../src/context/AppContext';
import type { EmergencyContact } from '../src/lib/types';
import {
  defaultEmergencyContact,
  defaultMedical,
  formatIceLine,
  normalizeMedical,
} from '../src/lib/storage';
import { tokens } from '../src/theme/tokens';

/** Stitch emergency contacts card — Primary Contact (ICE 1) with name, relationship, phone. */
export default function EmergencyContactsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateMedical } = useApp();
  const [contact, setContact] = useState<EmergencyContact>(() => {
    const m = normalizeMedical({ ...defaultMedical(), ...profile.medical });
    return m.primaryContact ?? defaultEmergencyContact();
  });
  const userEdited = useRef(false);

  useEffect(() => {
    if (userEdited.current || !profile.medical) return;
    const m = normalizeMedical(profile.medical);
    setContact(m.primaryContact ?? defaultEmergencyContact());
  }, [profile.medical]);

  const save = async () => {
    if (!contact.fullName.trim() || !contact.phone.trim()) {
      Alert.alert('Required fields', 'Enter the full name and phone number for your primary contact.');
      return;
    }
    const m = normalizeMedical({
      ...defaultMedical(),
      ...profile.medical,
      primaryContact: contact,
      emergencyContact: formatIceLine(contact),
    });
    userEdited.current = true;
    await updateMedical(m);
    router.back();
  };

  return (
    <View style={styles.root}>
      <NovaTopBar title="EMERGENCY CONTACTS" subtitle="Family & ICE" showBack />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <MaterialIcons name="contact-emergency" size={24} color={tokens.primary} />
          <HudText variant="headlineMd" style={styles.title}>
            Emergency Contacts
          </HudText>
          <Pressable
            onPress={() =>
              setContact({
                fullName: '',
                relationship: '',
                phone: '',
              })
            }
            style={styles.addBtn}
          >
            <MaterialIcons name="add" size={18} color={tokens.primary} />
            <HudText variant="mono" style={styles.addLabel}>
              Add
            </HudText>
          </Pressable>
        </View>

        <HudCard>
          <View style={styles.cardHead}>
            <HudText variant="bodyMd" style={styles.iceTitle}>
              Primary Contact (ICE 1)
            </HudText>
            <Pressable onPress={() => setContact(defaultEmergencyContact())}>
              <MaterialIcons name="delete-outline" size={22} color={tokens.outline} />
            </Pressable>
          </View>
          <HudText variant="mono" style={styles.label}>
            Full Name
          </HudText>
          <NovaInput
            value={contact.fullName}
            onChangeText={(t) => {
              userEdited.current = true;
              setContact((c) => ({ ...c, fullName: t }));
            }}
            placeholder="Sarah Jenkins"
          />
          <HudText variant="mono" style={styles.label}>
            Relationship
          </HudText>
          <NovaInput
            value={contact.relationship}
            onChangeText={(t) => {
              userEdited.current = true;
              setContact((c) => ({ ...c, relationship: t }));
            }}
            placeholder="Spouse"
          />
          <HudText variant="mono" style={styles.label}>
            Phone Number
          </HudText>
          <NovaInput
            value={contact.phone}
            onChangeText={(t) => {
              userEdited.current = true;
              setContact((c) => ({ ...c, phone: t }));
            }}
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
          />
        </HudCard>

        <View style={styles.actions}>
          <NovaButton label="Cancel" variant="ghost" onPress={() => router.back()} style={{ flex: 1 }} />
          <NovaButton label="Save & continue" onPress={save} large style={{ flex: 1 }} />
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
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 },
  addLabel: { color: tokens.primary, fontSize: 12 },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iceTitle: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  label: { color: tokens.primary, fontSize: 11, marginTop: 10, marginBottom: 4 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
