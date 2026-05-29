import { useState } from 'react';
import { Platform, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { tokens } from '../theme/tokens';

export function MargiInput(props: TextInputProps & { multiline?: boolean }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.wrap, focused && styles.focused]}>
      <TextInput
        placeholderTextColor={tokens.outline}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[styles.input, props.multiline && styles.multiline, props.style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: tokens.radius.input,
    borderWidth: 1,
    borderColor: tokens.primary,
    backgroundColor: tokens.surface,
  },
  focused: {
    borderWidth: 2,
    borderColor: tokens.primary,
    margin: -1,
    ...(Platform.OS === 'android'
      ? {}
      : {
          shadowColor: tokens.primary,
          shadowOpacity: 0.18,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 0 },
        }),
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: tokens.onSurface,
    fontSize: 16,
    fontFamily: 'PublicSans_400Regular',
    minHeight: 48,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
});
