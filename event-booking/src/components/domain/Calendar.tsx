import { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import DateTimePicker, {
  type CalendarDay,
  useDefaultStyles,
} from 'react-native-ui-datepicker';
import { ThemedText } from '@/src/components/ui/themed-text';
import type { CalendarDateItem } from '@/src/types/event';
import { getMonthName } from '@/src/utils/dateHelpers';

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

type ViewMode = 'day' | 'month' | 'year';

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
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  const eventMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of calendarDates) {
      map.set(item.date, item.count);
    }
    return map;
  }, [calendarDates]);

  const customStyles = {
    ...defaultStyles,
    calendar: {
      ...defaultStyles.calendar,
      backgroundColor: '#fff',
    },
    header: {
      ...defaultStyles.header,
      backgroundColor: '#fff',
      paddingHorizontal: 8,
      paddingVertical: 12,
    },
    header_label: {
      ...defaultStyles.header_label,
      color: '#11181c',
      fontSize: 17,
      fontWeight: '600' as const,
    },
    month_selector_label: {
      ...defaultStyles.month_selector_label,
      color: '#11181c',
      fontSize: 17,
      fontWeight: '600' as const,
    },
    year_selector_label: {
      ...defaultStyles.year_selector_label,
      color: '#11181c',
      fontSize: 17,
      fontWeight: '600' as const,
    },
    weekdays: {
      ...defaultStyles.weekdays,
      backgroundColor: '#fff',
    },
    weekday: {
      ...defaultStyles.weekday,
      color: '#687076',
    },
    day: {
      ...defaultStyles.day,
      backgroundColor: '#fff',
    },
    day_label: {
      ...defaultStyles.day_label,
      color: '#11181c',
    },
    today: {
      ...defaultStyles.today,
      borderColor: '#0a7ea4',
      borderWidth: 2,
      backgroundColor: '#fff',
    },
    today_label: {
      ...defaultStyles.today_label,
      color: '#0a7ea4',
    },
    selected: {
      ...defaultStyles.selected,
      backgroundColor: '#0a7ea4',
    },
    selected_label: {
      ...defaultStyles.selected_label,
      color: '#fff',
      fontWeight: '700' as const,
    },
    placeholder: {
      ...defaultStyles.placeholder,
      color: '#d1d5db',
    },
    month_container: {
      ...defaultStyles.month_container,
      backgroundColor: '#fff',
    },
    month: {
      ...defaultStyles.month,
      backgroundColor: '#f5f5f5',
    },
    month_label: {
      ...defaultStyles.month_label,
      color: '#11181c',
    },
    year_container: {
      ...defaultStyles.year_container,
      backgroundColor: '#fff',
    },
    year: {
      ...defaultStyles.year,
      backgroundColor: '#f5f5f5',
    },
    year_label: {
      ...defaultStyles.year_label,
      color: '#11181c',
    },
  };

  const CustomDay = (day: CalendarDay) => {
    const count = eventMap.get(day.date) || 0;
    const hasEvents = count > 0;

    return (
      <View style={dayStyles.dayWrapper}>
        <View
          style={[
            dayStyles.dayCircle,
            day.isSelected && dayStyles.selected,
            day.isToday && !day.isSelected && dayStyles.today,
            !day.isCurrentMonth && dayStyles.outsideMonth,
          ]}
        >
          <ThemedText
            style={[
              dayStyles.dayText,
              day.isSelected && dayStyles.selectedText,
              day.isToday && !day.isSelected && dayStyles.todayText,
              !day.isCurrentMonth && dayStyles.outsideMonthText,
            ]}
          >
            {day.number}
          </ThemedText>
        </View>
        {hasEvents && (
          <View style={dayStyles.dotsRow}>
            {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
              <View key={i} style={dayStyles.dot} />
            ))}
          </View>
        )}
      </View>
    );
  };

  const handleHeaderPress = () => {
    if (viewMode === 'day') {
      setViewMode('month');
    } else if (viewMode === 'month') {
      setViewMode('year');
    } else {
      setViewMode('day');
    }
  };

  const handleMonthChange = (month: number) => {
    onMonthChange(month + 1);
    setViewMode('day');
  };

  const handleYearChange = (year: number) => {
    onYearChange(year);
    setViewMode('month');
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.customHeader} onPress={handleHeaderPress}>
        <ThemedText style={styles.customHeaderText}>
          {getMonthName(currentMonth)} {currentYear}
        </ThemedText>
      </Pressable>
      <DateTimePicker
        key={viewMode}
        mode="single"
        date={selectedDate || undefined}
        onChange={({ date }) => {
          if (date) {
            const dateStr = typeof date === 'string'
              ? date.substring(0, 10)
              : new Date(date as number | Date).toISOString().substring(0, 10);
            onDatePress(dateStr);
          }
        }}
        month={currentMonth - 1}
        year={currentYear}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
        locale="es"
        firstDayOfWeek={1}
        weekdaysFormat="min"
        monthsFormat="short"
        monthCaptionFormat="full"
        initialView={viewMode}
        hideHeader={true}
        disableMonthPicker={true}
        disableYearPicker={true}
        styles={customStyles}
        components={{
          Day: CustomDay,
        }}
      />
      {calendarLoading && (
        <View style={styles.loadingOverlay}>
          <ThemedText style={styles.loadingText}>Cargando...</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
  },
  customHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  customHeaderText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#11181c',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#687076',
    fontSize: 13,
  },
});

const dayStyles = StyleSheet.create({
  dayWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: '#0a7ea4',
  },
  today: {
    borderWidth: 2,
    borderColor: '#0a7ea4',
  },
  outsideMonth: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    color: '#11181c',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  todayText: {
    color: '#0a7ea4',
    fontWeight: '700',
  },
  outsideMonthText: {
    color: '#d1d5db',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0a7ea4',
  },
});
