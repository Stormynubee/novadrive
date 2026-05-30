import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';

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

  return {
    torchOn,
    toggleTorch,
    turnOffTorch,
    torchReady: Boolean(permission?.granted),
  };
}
