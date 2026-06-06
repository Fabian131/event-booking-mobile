import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import DateTimePicker, {
  type CalendarDay,
  useDefaultStyles,
} from 'react-native-ui-datepicker';
import { ThemedText } from '@/src/components/ui/themed-text';
import type { CalendarDateItem } from '@/src/types/event';

interface CalendarProps {
  calendarDates: CalendarDateItem[];
  selectedDate: string | null;
  currentYear: number;
  currentMonth: number;
  onDatePress: (date: string) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  calendarLoading: boolean;
}

export function Calendar({
  calendarDates,
  selectedDate,
  currentYear,
  currentMonth,
  onDatePress,
  onMonthChange,
  onYearChange,
  calendarLoading,
}: CalendarProps) {
  const defaultStyles = useDefaultStyles();

  const eventMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of calendarDates) {
      map.set(item.date, item.count);
    }
    return map;
  }, [calendarDates]);

  const customStyles = {
    ...defaultStyles,
    header: { ...defaultStyles.header, backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 12 },
    month_selector_label: { ...defaultStyles.month_selector_label, color: '#11181c' },
    year_selector_label: { ...defaultStyles.year_selector_label, color: '#11181c' },
    weekdays: { ...defaultStyles.weekdays, backgroundColor: '#fff' },
    weekday: { ...defaultStyles.weekday, color: '#687076' },
    day: { ...defaultStyles.day, backgroundColor: '#fff' },
    day_label: { ...defaultStyles.day_label, color: '#11181c' },
    today: { ...defaultStyles.today, borderColor: '#b0b8bf', borderWidth: 1, backgroundColor: '#f0f4f8' },
    today_label: { ...defaultStyles.today_label, color: '#444e57' },
    selected: { ...defaultStyles.selected, backgroundColor: '#0a7ea4' },
    selected_label: { ...defaultStyles.selected_label, color: '#fff', fontWeight: '700' as const },
    month: { ...defaultStyles.month, backgroundColor: '#f5f5f5' },
    month_label: { ...defaultStyles.month_label, color: '#11181c' },
    year: { ...defaultStyles.year, backgroundColor: '#f5f5f5' },
    year_label: { ...defaultStyles.year_label, color: '#11181c' },
    button_prev_image: { ...defaultStyles.button_prev_image, tintColor: '#000' },
    button_next_image: { ...defaultStyles.button_next_image, tintColor: '#000' },
  };

  const CustomDay = (day: CalendarDay) => {
    // day.date can be a Dayjs object or a string depending on the library version
    const dateKey =
      typeof day.date === 'string'
        ? day.date.substring(0, 10)
        : dayjs(day.date as any).format('YYYY-MM-DD');
    const count = eventMap.get(dateKey) ?? 0;
    // DEBUG: log only day 1 to avoid flooding console
    if (day.number === 1 && day.isCurrentMonth) {
      console.log('[Calendar] day.date raw:', day.date, 'typeof:', typeof day.date, 'dateKey:', dateKey, 'count:', count, 'mapHas:', eventMap.has(dateKey));
    }
    const hasEvents = count > 0;
    const dotCount = Math.min(count, 3);

    return (
      <View style={d.dayWrapper}>
        <View
          style={[
            d.dayCircle,
            day.isSelected && d.selected,
            day.isToday && !day.isSelected && d.today,
            !day.isCurrentMonth && d.outside,
          ]}
        >
          <ThemedText
            style={[
              d.dayText,
              day.isSelected && d.selectedText,
              day.isToday && !day.isSelected && d.todayText,
              !day.isCurrentMonth && d.outsideText,
            ]}
          >
            {day.number}
          </ThemedText>
          {hasEvents && (
            <View style={d.dotsContainer}>
              {Array.from({ length: dotCount }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    d.dot,
                    day.isSelected && d.dotSelected,
                    !day.isCurrentMonth && d.dotOutside,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const handleMonthChange = (month: number) => {
    onMonthChange(month + 1);
  };

  const onPickerChange = ({ date }: { date?: string | Date }) => {
    if (date) {
      const dateStr = typeof date === 'string'
        ? date.substring(0, 10)
        : new Date(date as number | Date).toISOString().substring(0, 10);
      onDatePress(dateStr);
    }
  };

  return (
    <View style={s.container}>
      <DateTimePicker
        mode="single"
        date={selectedDate || undefined}
        onChange={onPickerChange}
        month={currentMonth - 1}
        year={currentYear}
        onMonthChange={handleMonthChange}
        onYearChange={onYearChange}
        locale="es"
        firstDayOfWeek={1}
        weekdaysFormat="min"
        monthsFormat="short"
        monthCaptionFormat="full"
        styles={customStyles}
        components={{ Day: CustomDay }}
      />
      {calendarLoading && (
        <View style={s.loadingOverlay}>
          <ThemedText style={s.loadingText}>Cargando...</ThemedText>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 8 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#687076', fontSize: 13 },
});

const d = StyleSheet.create({
  dayWrapper: { alignItems: 'center', justifyContent: 'center' },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { backgroundColor: '#0a7ea4' },
  today: { borderWidth: 1, borderColor: '#b0b8bf', backgroundColor: '#f0f4f8' },
  outside: { opacity: 0.3 },
  dayText: { fontSize: 14, color: '#11181c' },
  selectedText: { color: '#fff', fontWeight: '700' },
  todayText: { color: '#444e57' },
  outsideText: { color: '#d1d5db' },
  // Dots positioned absolutely at the bottom of the circle
  dotsContainer: {
    position: 'absolute',
    bottom: 3,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0a7ea4',
  },
  dotSelected: { backgroundColor: 'rgba(255,255,255,0.9)' },
  dotOutside: { backgroundColor: '#b0c4ce' },
});
