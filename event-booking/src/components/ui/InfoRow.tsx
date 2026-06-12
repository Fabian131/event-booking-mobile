import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';

interface InfoRowProps {
  label: string;
  value: string;
  valueStyle?: object;
}

export function InfoRow({ label, value, valueStyle }: InfoRowProps) {
  return (
    <View style={styles.row}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={[styles.value, valueStyle]}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 12 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9BA1A6',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  value: { fontSize: 15, color: '#11181c', fontWeight: '500' },
});
