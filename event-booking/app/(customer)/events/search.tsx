import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { EVENTS } from '@/src/constants/ui';

export default function EventSearchScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {EVENTS.SEARCH_TITLE}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {EVENTS.SEARCH_SUBTITLE}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 24,
    gap: 8,
  },
  title: {
    color: '#11181c',
  },
  subtitle: {
    color: '#687076',
    lineHeight: 20,
  },
});
