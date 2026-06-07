import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { Button } from '@/src/components/ui/Button';
import { ADMIN } from '@/src/constants/ui';

export default function AdminCalendarScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">{ADMIN.CALENDAR_TITLE}</ThemedText>
        <ThemedText>{ADMIN.CALENDAR_SUBTITLE}</ThemedText>
      </ThemedView>

      <View style={{ marginTop: 20 }}>
        <Link href="/(admin)/create-event" asChild>
          <Button title={ADMIN.CREATE_EVENT_NAV} onPress={() => {}} />
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
