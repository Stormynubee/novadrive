import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export function useTorch() {
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);

  const toggleTorch = useCallback(async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Camera required for torch',
          'Margi uses the rear camera flash briefly as a safety torch during emergencies.'
        );
        return;
      }
    }
    setTorchOn((on) => !on);
  }, [permission?.granted, requestPermission]);

  const turnOffTorch = useCallback(() => setTorchOn(false), []);

  const TorchLayer =
    torchOn && permission?.granted ? (
      <View style={styles.torchHost} pointerEvents="none">
        <CameraView style={styles.torchCamera} facing="back" enableTorch />
      </View>
    ) : null;

  return { torchOn, toggleTorch, turnOffTorch, TorchLayer };
}

const styles = StyleSheet.create({
  torchHost: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    left: -80,
    top: -80,
    overflow: 'hidden',
  },
  torchCamera: { width: 1, height: 1 },
});
