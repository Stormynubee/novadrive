import { type Href, router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useApp } from '../../src/context/AppContext';
import {
  EMERGENCY_ACTIVATION_PATH,
  EMERGENCY_RESPONSE_PATH,
  shouldGateTriageWithoutIncident,
} from '../../src/lib/emergency/emergencyNavigation';
import { tokens } from '../../src/theme/tokens';

export default function TriageScreen() {
  const { session } = useApp();

  useEffect(() => {
    if (shouldGateTriageWithoutIncident(session.incidentType)) {
      router.replace(EMERGENCY_ACTIVATION_PATH as Href);
      return;
    }
    router.replace(EMERGENCY_RESPONSE_PATH as Href);
  }, [session.incidentType]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.background }}>
      <ActivityIndicator color={tokens.primary} />
    </View>
  );
}
