import { StyleSheet, View } from 'react-native';
import { CameraView } from 'expo-camera';

export function TorchCameraLayer({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <View style={styles.torchHost} pointerEvents="none">
      <CameraView style={styles.torchCamera} facing="back" enableTorch />
    </View>
  );
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
