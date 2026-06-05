import { StyleSheet } from 'react-native';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';

export default function CustomerEventsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Eventos</ThemedText>
        <ThemedText>Explora los eventos disponibles</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    gap: 8,
    marginBottom: 24,
  },
});
