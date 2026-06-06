import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { UnitSpinner } from './UnitSpinner';

interface JSTimePickerProps {
  value: Date;
  onChange: (d: Date) => void;
}

export function JSTimePicker({ value, onChange }: JSTimePickerProps) {
  function adj(fn: (d: Date) => void) {
    const d = new Date(value);
    fn(d);
    onChange(d);
  }

  return (
    <View style={styles.row}>
      <UnitSpinner
        label="Hora"
        value={String(value.getHours()).padStart(2, '0')}
        onUp={() => adj((d) => d.setHours((d.getHours() + 1) % 24))}
        onDown={() => adj((d) => d.setHours((d.getHours() + 23) % 24))}
      />
      <View style={styles.colon}>
        <ThemedText style={styles.colonTxt}>:</ThemedText>
      </View>
      <UnitSpinner
        label="Min"
        value={String(value.getMinutes()).padStart(2, '0')}
        onUp={() => adj((d) => d.setMinutes((d.getMinutes() + 1) % 60))}
        onDown={() => adj((d) => d.setMinutes((d.getMinutes() + 59) % 60))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, gap: 8 },
  colon: { alignItems: 'center', paddingTop: 30 },
  colonTxt: { fontSize: 26, fontWeight: '700', color: '#555' },
});
