import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../src/context/AppContext';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ title: 'Sign in' }} />
        <Stack.Screen name="medical" options={{ title: 'Medical profile' }} />
        <Stack.Screen name="accessibility" options={{ title: 'Accessibility' }} />
        <Stack.Screen name="home" options={{ title: 'NovaDrive' }} />
        <Stack.Screen name="journey" options={{ title: 'Journey' }} />
        <Stack.Screen name="emergency/locate" options={{ title: 'Locate' }} />
        <Stack.Screen name="emergency/triage" options={{ title: 'Triage' }} />
        <Stack.Screen name="emergency/route" options={{ title: 'Route' }} />
        <Stack.Screen name="emergency/packet" options={{ title: 'Golden Hour Packet' }} />
        <Stack.Screen name="emergency/relay" options={{ title: 'Relay' }} />
        <Stack.Screen name="scan" options={{ title: 'Scan relay QR' }} />
      </Stack>
    </AppProvider>
  );
}
