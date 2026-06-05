import type { TouchableOpacityProps } from 'react-native';
import { ActivityIndicator, StyleSheet, TouchableOpacity, ViewStyle, View } from 'react-native';
import { ThemedText } from './themed-text';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}

export function Button({
  title,
  loading = false,
  variant = 'primary',
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const buttonStyle = [
    styles.base,
    variant === 'primary' ? styles.primary : styles.secondary,
    isDisabled && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <View>
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.text,
              variant === 'secondary' && styles.secondaryText,
            ]}
          >
            {title}
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#0a7ea4',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#fff',
  },
  secondaryText: {
    color: '#0a7ea4',
  },
});
