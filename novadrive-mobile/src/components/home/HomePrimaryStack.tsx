import { StyleSheet, View } from 'react-native';
import { DriveModeCard } from './DriveModeCard';
import { NaariShaktiPortalButton } from './NaariShaktiPortalButton';
import { tokens } from '../../theme/tokens';

type Props = {
  onEnterDrive: () => void;
  onNaariPress?: () => void;
  showNaari: boolean;
};

/**
 * Scanning-grid hero stack: ENTER DRIVE MODE + optional Naari Shakti (female users only).
 */
export function HomePrimaryStack({ onEnterDrive, onNaariPress, showNaari }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.grid} pointerEvents="none" />
      <View style={styles.stack}>
        <DriveModeCard onPress={onEnterDrive} />
        {showNaari && onNaariPress ? <NaariShaktiPortalButton onPress={onNaariPress} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    position: 'relative',
    zIndex: 1,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    margin: -12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,33,71,0.08)',
    backgroundColor: 'rgba(0,33,71,0.04)',
  },
  stack: { gap: 16, width: '100%' },
});
