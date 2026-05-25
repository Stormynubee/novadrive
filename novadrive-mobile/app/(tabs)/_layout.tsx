import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { NovaTabBar } from '../../src/components/NovaTabBar';
import { SarthiOverlayBridge } from '../../src/components/sarthi/SarthiOverlayBridge';
import { QuickMenuProvider } from '../../src/context/QuickMenuContext';
import { tokens } from '../../src/theme/tokens';

export default function TabsLayout() {
  return (
    <QuickMenuProvider>
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
          sceneStyle: { backgroundColor: tokens.background },
          animation: 'shift',
        }}
      >
        <Tabs.Screen name="explore" />
        <Tabs.Screen name="drive" />
        <Tabs.Screen name="history" />
        <Tabs.Screen name="profile" />
      </Tabs>
      <NovaTabBar />
      <SarthiOverlayBridge />
    </View>
    </QuickMenuProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
});
