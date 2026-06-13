import { useState } from 'react';
import type { TextInputProps } from 'react-native';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from './themed-text';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, secureTextEntry, style, ...rest }: InputProps) {
  const hasError = !!error;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            secureTextEntry && styles.inputWithToggle,
            hasError && styles.inputError,
            style,
          ]}
          placeholderTextColor="#9ba1a6"
          autoCapitalize="none"
          accessibilityLabel={label}
          accessibilityState={{ disabled: rest.editable === false }}
          secureTextEntry={secureTextEntry && !showPassword}
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.toggle}
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={22}
              color="#687076"
            />
          </TouchableOpacity>
        )}
      </View>
      {hasError && <ThemedText style={styles.error}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    marginBottom: 0,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#11181c',
    backgroundColor: '#fff',
  },
  inputWithToggle: {
    paddingRight: 44,
  },
  inputError: {
    borderColor: '#dc3545',
  },
  toggle: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  error: {
    fontSize: 13,
    color: '#dc3545',
  },
});
