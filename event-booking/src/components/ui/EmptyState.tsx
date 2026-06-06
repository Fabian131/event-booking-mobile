import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon && <ThemedText style={styles.icon}>{icon}</ThemedText>}
      <ThemedText type="defaultSemiBold" style={styles.title}>
        {title}
      </ThemedText>
      {subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>}
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
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 18,
    color: '#11181c',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
    lineHeight: 20,
  },
});
