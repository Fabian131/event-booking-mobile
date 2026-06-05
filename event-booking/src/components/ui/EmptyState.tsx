import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText style={styles.message}>{message}</ThemedText>
    </View>
  );
}

export function LoadingState({ message }: { message?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0a7ea4" />
      {message ? <ThemedText style={styles.message}>{message}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  title: {
    color: '#687076',
  },
  message: {
    color: '#9ba1a6',
    textAlign: 'center',
  },
});
