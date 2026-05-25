import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { tokens } from '../theme/tokens';

export function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          onPress={() => onChange(n)}
          accessibilityLabel={`Rate ${n} stars`}
          hitSlop={8}
        >
          <MaterialIcons
            name={n <= value ? 'star' : 'star-border'}
            size={36}
            color={n <= value ? tokens.secondary : tokens.outlineVariant}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 4 },
});
