import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { MargiButton } from '../../src/components/MargiButton';
import { MargiInput } from '../../src/components/MargiInput';
import { useApp } from '../../src/context/AppContext';
import { getSupabaseClient, isSupabaseConfigured } from '../../src/lib/supabase/client';
import { registerVolunteerProvider } from '../../src/lib/ngo/volunteerProviders';
import { tokens } from '../../src/theme/tokens';

export default function NgoRegisterScreen() {
  const { profile } = useApp();
  const [orgName, setOrgName] = useState('');
  const [contactName, setContactName] = useState(profile.name ?? '');
  const [phone, setPhone] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!orgName.trim() || !contactName.trim() || !phone.trim() || !serviceArea.trim()) {
      Alert.alert('Required fields', 'Fill org name, contact, phone, and service area.');
      return;
    }
    const client = getSupabaseClient();
    if (!client || !profile.supabaseUserId) {
      Alert.alert('Sign in required', 'Create an account to register as a volunteer provider.');
      return;
    }
    setBusy(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Location required', 'Allow location to pin your service area.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { id, error } = await registerVolunteerProvider(client, profile.supabaseUserId, {
        orgName,
        contactName,
        phone,
        serviceArea,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
      if (error || !id) {
        Alert.alert('Registration failed', error ?? 'Could not save provider.');
        return;
      }
      Alert.alert(
        'Registered',
        'Your NGO/ambulance volunteer listing is pending verification. A hackathon admin can mark it verified in Supabase Studio.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <HudText variant="headlineMd" style={styles.title}>
        Volunteer transport registry
      </HudText>
      <HudText variant="bodySm" style={styles.sub}>
        {isSupabaseConfigured()
          ? 'List your NGO or community ambulance. Verified providers appear in emergency alternate transport.'
          : 'Configure Supabase to enable online registration.'}
      </HudText>
      <HudCard>
        <MargiInput placeholder="Organization name" value={orgName} onChangeText={setOrgName} />
        <MargiInput placeholder="Contact name" value={contactName} onChangeText={setContactName} />
        <MargiInput placeholder="Phone (+91…)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <MargiInput placeholder="Service area label" value={serviceArea} onChangeText={setServiceArea} />
        <MargiButton
          label={busy ? 'Saving…' : 'Register provider'}
          onPress={() => void submit()}
          large
          disabled={busy}
          style={{ marginTop: 16 }}
        />
      </HudCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 12 },
  title: { color: tokens.primary },
  sub: { color: tokens.onSurfaceVariant, marginBottom: 8 },
});
