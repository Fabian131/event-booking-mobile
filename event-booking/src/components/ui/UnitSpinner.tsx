import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';

interface UnitSpinnerProps {
  label: string;
  value: string;
  onUp: () => void;
  onDown: () => void;
}

export function UnitSpinner({ label, value, onUp, onDown }: UnitSpinnerProps) {
  return (
    <View style={styles.unit}>
      <ThemedText style={styles.unitLabel}>{label}</ThemedText>
      <TouchableOpacity onPress={onUp} style={styles.btn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <ThemedText style={styles.arrow}>{'▲'}</ThemedText>
      </TouchableOpacity>
      <View style={styles.box}>
        <ThemedText style={styles.val}>{value}</ThemedText>
      </View>
      <TouchableOpacity onPress={onDown} style={styles.btn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <ThemedText style={styles.arrow}>{'▼'}</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  unit: { alignItems: 'center', flex: 1 },
  unitLabel: { fontSize: 11, color: '#888', marginBottom: 6 },
  btn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4FF', borderRadius: 8 },
  arrow: { fontSize: 14, color: '#1A56DB' },
  box: { width: 70, height: 54, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEF4FF', borderRadius: 10, marginVertical: 6, borderWidth: 1.5, borderColor: '#C5D8FF' },
  val: { fontSize: 24, fontWeight: '700', color: '#1A56DB' },
});
