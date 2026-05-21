import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { isOnboarded } from '../src/lib/storage';
import { colors } from '../src/theme/colors';

export default function Index() {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    isOnboarded().then((v) => {
      setOnboarded(v);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.amber} />
      </View>
    );
  }

  if (!onboarded) return <Redirect href="/splash" />;
  return <Redirect href="/home" />;
}
