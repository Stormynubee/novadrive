import { Alert } from 'react-native';
import { QUICK_SOS_ALERT } from './quickSosAlert';

export { QUICK_SOS_ALERT } from './quickSosAlert';

export function runQuickSos(onProceed: () => void) {
  Alert.alert(QUICK_SOS_ALERT.title, QUICK_SOS_ALERT.message, [
    { text: QUICK_SOS_ALERT.cancel, style: 'cancel' },
    { text: QUICK_SOS_ALERT.confirm, style: 'destructive', onPress: onProceed },
  ]);
}
