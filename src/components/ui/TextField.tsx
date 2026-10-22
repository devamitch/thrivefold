import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { SquircleSurface } from './SquircleSurface';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function TextField({
  label,
  error,
  containerStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  ...rest
}: TextFieldProps) {
  const { colors, typography } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, typography.caption, { color: colors.text.secondary }]}>
          {label}
        </Text>
      ) : null}
      <SquircleSurface
        radius={14}
        smoothing={1}
        fill={colors.surface1}
        stroke={error ? colors.error : isFocused ? colors.primary : undefined}
        strokeWidth={isFocused || error ? 1 : 0}
        style={styles.surface}
      >
        <View style={styles.inputWrapper}>
          {leftIcon}
          <TextInput
            placeholderTextColor={colors.text.muted}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={[
              styles.input,
              typography.body,
              { color: colors.text.primary },
              inputStyle,
            ]}
            {...rest}
          />
          {rightIcon}
        </View>
      </SquircleSurface>
      {error ? (
        <Text style={[styles.error, typography.caption, { color: colors.error }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
    padding: 0,
  },
  surface: {
    minHeight: 48,
    justifyContent: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    paddingVertical: 0,
  },
  error: {
    marginTop: 4,
    padding: 0,
  },
});

export default TextField;
