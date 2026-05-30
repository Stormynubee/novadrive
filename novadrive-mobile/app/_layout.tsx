import {
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  HankenGrotesk_800ExtraBold,
} from '@expo-google-fonts/hanken-grotesk';
import {
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
  PublicSans_700Bold,
} from '@expo-google-fonts/public-sans';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { AppProvider } from '../src/context/AppContext';
import { NaariShaktiProvider } from '../src/context/NaariShaktiContext';
import { SarthiProvider } from '../src/context/SarthiContext';
import { SafetyMonitorBridge } from '../src/components/SafetyMonitorBridge';
import { tokens } from '../src/theme/tokens';

export default function RootLayout() {
  const [loaded] = useFonts({
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
    PublicSans_400Regular,
    PublicSans_500Medium,
    PublicSans_600SemiBold,
    PublicSans_700Bold,
  });

  if (!loaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: tokens.primary,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator color={tokens.secondary} />
      </View>
    );
  }

  return (
    <AppProvider>
      <NaariShaktiProvider>
      <SarthiProvider>
      <SafetyMonitorBridge />
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: tokens.primary },
          headerTintColor: tokens.onPrimary,
          headerTitleStyle: { fontFamily: 'HankenGrotesk_700Bold' },
          contentStyle: { backgroundColor: tokens.background },
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="medical" options={{ headerShown: false }} />
        <Stack.Screen name="accessibility" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="trip" options={{ headerShown: false }} />
        <Stack.Screen name="journey/depart" options={{ headerShown: false }} />
        <Stack.Screen name="journey/complete" options={{ headerShown: false }} />
        <Stack.Screen name="journey/feedback" options={{ headerShown: false }} />
        <Stack.Screen name="journey" options={{ headerShown: false }} />
        <Stack.Screen name="emergency/locate" options={{ headerShown: false, animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="emergency/activation" options={{ headerShown: false, animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="emergency/response" options={{ headerShown: false, animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="emergency/selection" options={{ headerShown: false, animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="emergency/triage" options={{ headerShown: false, animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="emergency/route" options={{ headerShown: false, animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="emergency/packet" options={{ headerShown: false, animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="emergency/relay" options={{ headerShown: false, animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="scan" options={{ headerShown: false }} />
        <Stack.Screen
          name="sarthi"
          options={{ headerShown: false, animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="settings/journey-history" options={{ headerShown: false }} />
        <Stack.Screen name="rahveer/index" options={{ headerShown: false }} />
        <Stack.Screen name="rahveer/claim" options={{ headerShown: false }} />
        <Stack.Screen name="ngo/index" options={{ title: 'Volunteer registry', headerShown: true }} />
        <Stack.Screen name="ngo/register" options={{ title: 'Register NGO', headerShown: true }} />
        <Stack.Screen name="emergency-contacts" options={{ headerShown: false }} />
        <Stack.Screen name="naari-shakti" options={{ headerShown: false }} />
        <Stack.Screen name="brief/[slug]" options={{ headerShown: false }} />
      </Stack>
      </SarthiProvider>
      </NaariShaktiProvider>
    </AppProvider>
  );
}
