import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { Button } from '@/src/components/ui/Button';

export default function AdminCalendarScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Calendario</ThemedText>
        <ThemedText>Consulta la disponibilidad de eventos</ThemedText>
      </ThemedView>

      <View style={{ marginTop: 20 }}>
        <Link href="/(admin)/create-event" asChild>
          <Button title="Prueba temporal: Crear Evento" onPress={() => {}} />
        </Link>
      </View>
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
