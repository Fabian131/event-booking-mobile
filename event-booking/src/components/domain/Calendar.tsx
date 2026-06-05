import { useEffect, useRef, useMemo } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import type { CalendarDateItem, DayCell } from '@/src/types/event';
import {
  buildMonthGrid,
  getMonthName,
  getDayNames,
  getToday,
} from '@/src/utils/dateHelpers';

interface CalendarProps {
  calendarDates: CalendarDateItem[];
  selectedDate: string | null;
  currentYear: number;
  currentMonth: number;
  onDatePress: (date: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  loading?: boolean;
}

function Dots({ count }: { count: number }) {
  if (count === 0) return null;
  const visible = Math.min(count, 3);
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: visible }).map((_, i) => (
        <View key={i} style={dotStyles.dot} />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: {
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

export function Calendar({
  calendarDates,
  selectedDate,
  currentYear,
  currentMonth,
  onDatePress,
  onPreviousMonth,
  onNextMonth,
  loading = false,
}: CalendarProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const eventMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of calendarDates) {
      map.set(item.date, item.count);
    }
    return map;
  }, [calendarDates]);

  const monthGrid = useMemo(
    () => buildMonthGrid(currentYear, currentMonth, eventMap, selectedDate),
    [currentYear, currentMonth, eventMap, selectedDate],
  );

  const today = getToday();

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [currentYear, currentMonth, fadeAnim]);

  const dayNames = getDayNames();
  const rows: DayCell[][] = [];
  for (let i = 0; i < monthGrid.length; i += 7) {
    rows.push(monthGrid.slice(i, i + 7));
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <CalendarHeader
          year={currentYear}
          month={currentMonth}
          onPrevious={onPreviousMonth}
          onNext={onNextMonth}
          loading
        />
        <SkeletonGrid />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <CalendarHeader
        year={currentYear}
        month={currentMonth}
        onPrevious={onPreviousMonth}
        onNext={onNextMonth}
      />

      <View style={styles.dayNameRow}>
        {dayNames.map((name) => (
          <View key={name} style={styles.dayNameCell}>
            <ThemedText style={styles.dayNameText}>{name}</ThemedText>
          </View>
        ))}
      </View>

      <Animated.View style={{ opacity: fadeAnim }}>
        {rows.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.weekRow}>
            {row.map((cell) => {
              const isSelected = cell.date === selectedDate;
              const isToday = cell.date === today;
              const isCurrent = cell.isCurrentMonth;
              const hasEvents = cell.eventCount > 0;

              return (
                <Pressable
                  key={cell.date}
                  style={styles.dayCell}
                  onPress={() => onDatePress(cell.date)}
                  accessibilityRole="button"
                  accessibilityLabel={`${cell.day} ${isSelected ? 'seleccionado' : ''} ${hasEvents ? `${cell.eventCount} eventos` : 'sin eventos'}`}
                >
                  <View
                    style={[
                      cellStyles.dayCircle,
                      isSelected && cellStyles.selectedCircle,
                      isToday && !isSelected && cellStyles.todayCircle,
                    ]}
                  >
                    <ThemedText
                      style={[
                        cellStyles.dayText,
                        !isCurrent && cellStyles.otherMonthText,
                        isSelected && cellStyles.selectedText,
                        isToday && !isSelected && cellStyles.todayText,
                      ]}
                    >
                      {cell.day}
                    </ThemedText>
                  </View>
                  <Dots count={cell.eventCount} />
                </Pressable>
              );
            })}
          </View>
        ))}
      </Animated.View>
    </ThemedView>
  );
}

function CalendarHeader({
  year,
  month,
  onPrevious,
  onNext,
  loading,
}: {
  year: number;
  month: number;
  onPrevious: () => void;
  onNext: () => void;
  loading?: boolean;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onPrevious}
        disabled={loading}
        style={styles.arrowButton}
        accessibilityRole="button"
        accessibilityLabel="Mes anterior"
      >
        <ThemedText style={styles.arrowText}>{'<'}</ThemedText>
      </Pressable>
      <ThemedText type="defaultSemiBold" style={styles.monthLabel}>
        {getMonthName(month)} {year}
      </ThemedText>
      <Pressable
        onPress={onNext}
        disabled={loading}
        style={styles.arrowButton}
        accessibilityRole="button"
        accessibilityLabel="Mes siguiente"
      >
        <ThemedText style={styles.arrowText}>{'>'}</ThemedText>
      </Pressable>
    </View>
  );
}

function SkeletonGrid() {
  const dayNames = getDayNames();
  return (
    <View>
      <View style={styles.dayNameRow}>
        {dayNames.map((name) => (
          <View key={name} style={styles.dayNameCell}>
            <ThemedText style={styles.dayNameText}>{name}</ThemedText>
          </View>
        ))}
      </View>
      {Array.from({ length: 6 }).map((_, rowIdx) => (
        <View key={rowIdx} style={styles.weekRow}>
          {Array.from({ length: 7 }).map((__, colIdx) => (
            <View key={colIdx} style={styles.dayCell}>
              <View style={[cellStyles.dayCircle, cellStyles.skeletonCircle]} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  monthLabel: {
    fontSize: 17,
  },
  arrowButton: {
    padding: 8,
  },
  arrowText: {
    fontSize: 18,
    color: '#0a7ea4',
    fontWeight: '600',
  },
  dayNameRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayNameText: {
    fontSize: 12,
    color: '#9ba1a6',
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    minHeight: 42,
  },
});

const cellStyles = StyleSheet.create({
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCircle: {
    backgroundColor: '#0a7ea4',
  },
  todayCircle: {
    borderWidth: 2,
    borderColor: '#0a7ea4',
  },
  skeletonCircle: {
    backgroundColor: '#e8eaed',
  },
  dayText: {
    fontSize: 14,
    color: '#11181c',
  },
  otherMonthText: {
    color: '#d1d5db',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  todayText: {
    color: '#0a7ea4',
    fontWeight: '700',
  },
});
