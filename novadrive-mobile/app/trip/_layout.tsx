import { Stack } from 'expo-router';
import { tokens } from '../../src/theme/tokens';

export default function TripLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 280,
        contentStyle: { backgroundColor: tokens.background },
      }}
    />
  );
}
