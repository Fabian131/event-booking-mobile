import { StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { Button } from '@/src/components/ui/Button';

export default function CreateEventScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Crear Evento</ThemedText>
        <ThemedText>Próximamente</ThemedText>
      </ThemedView>
      <Button
        title="Volver al calendario"
        onPress={() => router.back()}
        variant="secondary"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    gap: 8,
    alignItems: 'center',
  },
});
