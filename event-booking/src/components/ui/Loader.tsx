import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

interface LoaderProps {
  message?: string;
  size?: 'small' | 'large';
}

export function Loader({ message, size = 'large' }: LoaderProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color="#0a7ea4" />
      {message && <ThemedText style={styles.message}>{message}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  message: {
    color: '#687076',
    textAlign: 'center',
  },
});
