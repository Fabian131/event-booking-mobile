import { StyleSheet, View } from 'react-native';
import { UnitSpinner } from './UnitSpinner';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface JSDatePickerProps {
  value: Date;
  onChange: (d: Date) => void;
}

export function JSDatePicker({ value, onChange }: JSDatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function clamp(d: Date) {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c < today ? new Date(today) : c;
  }

  function adj(fn: (d: Date) => void) {
    const d = new Date(value);
    fn(d);
    onChange(clamp(d));
  }

  return (
    <View style={styles.row}>
      <UnitSpinner
        label="Día"
        value={String(value.getDate()).padStart(2, '0')}
        onUp={() => adj((d) => d.setDate(d.getDate() + 1))}
        onDown={() => adj((d) => d.setDate(d.getDate() - 1))}
      />
      <UnitSpinner
        label="Mes"
        value={MONTH_NAMES[value.getMonth()]}
        onUp={() => adj((d) => d.setMonth(d.getMonth() + 1))}
        onDown={() => adj((d) => d.setMonth(d.getMonth() - 1))}
      />
      <UnitSpinner
        label="Año"
        value={String(value.getFullYear())}
        onUp={() => adj((d) => d.setFullYear(d.getFullYear() + 1))}
        onDown={() => adj((d) => d.setFullYear(d.getFullYear() - 1))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, gap: 8 },
});
