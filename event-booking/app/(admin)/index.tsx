import { useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { EventCard } from '@/src/components/domain/EventCard';
import { Calendar } from '@/src/components/domain/Calendar';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Loader } from '@/src/components/ui/Loader';
import { useCalendarEvents } from '@/src/hooks/useCalendarEvents';

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
  } = useCalendarEvents();

  // Animation for the event list on date change
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  const handleDatePress = (date: string) => {
    fadeAnim.setValue(0);
    slideAnim.setValue(16);
    selectDate(date);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const renderEventList = () => {
    if (!selectedDate) {
      return <EmptyState title="Selecciona un día" subtitle="Toca un día en el calendario para ver sus eventos" />;
    }
    if (eventsLoading) {
      return <Loader message="Cargando eventos..." />;
    }
    if (error) {
      return (
        <View style={styles.errorBanner}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      );
    }
    if (dayEvents.length === 0) {
      return <EmptyState title="Sin eventos" subtitle="No hay eventos programados para este día" />;
    }
    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {dayEvents.map((event) => (
          <EventCard key={event.id} event={event} />
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
            {selectedDate ? `Eventos del ${selectedDate}` : 'Eventos del día'}
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
        accessibilityLabel="Crear evento"
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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
