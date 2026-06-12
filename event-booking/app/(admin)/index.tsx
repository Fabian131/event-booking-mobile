import { useRef, useCallback } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { EventCard } from '@/src/components/domain/EventCard';
import { Calendar } from '@/src/components/domain/Calendar';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Loader } from '@/src/components/ui/Loader';
import { useCalendarEvents } from '@/src/hooks/useCalendarEvents';
import { ADMIN } from '@/src/constants/ui';

export default function AdminCalendarScreen() {
  const router = useRouter();
  const {
    calendarDates,
    dayEvents,
    selectedDate,
    currentYear,
    currentMonth,
    calendarLoading,
    eventsLoading,
    error,
    selectDate,
    onMonthChange,
    onYearChange,
    refresh,
  } = useCalendarEvents();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Animation for the event list on date change
  const slideAnim = useRef(new Animated.Value(16)).current;

  const handleDatePress = (date: string) => {
    slideAnim.setValue(16);
    selectDate(date);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const renderEventList = () => {
    if (!selectedDate) {
      return <EmptyState title={ADMIN.CALENDAR_EMPTY_TITLE} subtitle={ADMIN.CALENDAR_EMPTY_SUBTITLE} />;
    }
    if (eventsLoading) {
      return <Loader message={ADMIN.CALENDAR_LOADING_EVENTS} />;
    }
    if (error) {
      return (
        <View style={styles.errorBanner}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      );
    }
    if (dayEvents.length === 0) {
      return <EmptyState title={ADMIN.CALENDAR_NO_EVENTS_TITLE} subtitle={ADMIN.CALENDAR_NO_EVENTS_SUBTITLE} />;
    }
    return (
      <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
        {dayEvents.map((event) => (
          <EventCard key={event.id} event={event} variant="compact" />
        ))}
      </Animated.View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarSection}>
          <Calendar
            calendarDates={calendarDates}
            selectedDate={selectedDate}
            currentYear={currentYear}
            currentMonth={currentMonth}
            onDatePress={handleDatePress}
            onMonthChange={onMonthChange}
            onYearChange={onYearChange}
            calendarLoading={calendarLoading}
          />
        </View>

        <View style={styles.eventsSection}>
          <ThemedText style={styles.sectionTitle}>
            {selectedDate ? `${ADMIN.CALENDAR_EVENTS_FOR_DAY} ${selectedDate}` : ADMIN.CALENDAR_EVENTS_TITLE}
          </ThemedText>
          {renderEventList()}
          <View style={styles.bottomSection} />
        </View>
      </ScrollView>

      {/* FAB — create event */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/(admin)/create-event')}
        accessibilityRole="button"
        accessibilityLabel={ADMIN.CREATE_EVENT_FAB_LABEL}
      >
        <ThemedText style={styles.fabText}>+</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 100 },
  calendarSection: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  eventsSection: { marginTop: 16, paddingHorizontal: 12 },
  sectionTitle: {
    fontSize: 13,
    color: '#687076',
    fontWeight: '500',
    marginBottom: 8,
  },
  bottomSection: { minHeight: 120 },
  errorBanner: {
    backgroundColor: '#fdecea',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  errorText: { color: '#dc3545', textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 28,
    fontWeight: '300',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
