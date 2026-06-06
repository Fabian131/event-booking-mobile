import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { EmptyState, LoadingState } from '@/src/components/ui/EmptyState';
import { Calendar } from '@/src/components/domain/Calendar';
import { EventCard } from '@/src/components/domain/EventCard';
import { useEvents } from '@/src/hooks/useEvents';
import type { EventSummary } from '@/src/types/event';

function EventList({ events, onPress }: { events: EventSummary[]; onPress: (id: string) => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(10);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [events]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <ThemedText style={styles.sectionTitle}>
        {events.length} {events.length === 1 ? 'evento' : 'eventos'}
      </ThemedText>
      {events.map((item) => (
        <EventCard key={item.id} event={item} onPress={() => onPress(item.id)} />
      ))}
    </Animated.View>
  );
}

export default function AdminCalendarScreen() {
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
  } = useEvents();

  const renderBottom = () => {
    if (!selectedDate) {
      return (
        <EmptyState
          title="Selecciona un día"
          message="Toca un día en el calendario para ver los eventos programados."
        />
      );
    }

    if (eventsLoading) {
      return <LoadingState message="Cargando eventos..." />;
    }

    if (error) {
      return (
        <View style={styles.errorBanner}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      );
    }

    if (dayEvents.length === 0) {
      return (
        <EmptyState
          title="Sin eventos"
          message="No hay eventos programados para esta fecha."
        />
      );
    }

    return (
      <EventList
        events={dayEvents}
        onPress={() => {}}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title">Calendario</ThemedText>
          <ThemedText>Consulta la disponibilidad de eventos</ThemedText>
        </ThemedView>

        <Calendar
          calendarDates={calendarDates}
          selectedDate={selectedDate}
          currentYear={currentYear}
          currentMonth={currentMonth}
          onDatePress={selectDate}
          onMonthChange={onMonthChange}
          onYearChange={onYearChange}
          calendarLoading={calendarLoading}
        />

        <View style={styles.divider} />

        <View style={styles.bottomSection}>{renderBottom()}</View>
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => router.push('/(tabs)/create-event')}
        accessibilityRole="button"
        accessibilityLabel="Crear nuevo evento"
      >
        <ThemedText style={styles.fabText}>+</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e8eaed',
    marginHorizontal: 16,
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#687076',
    fontWeight: '500',
    marginHorizontal: 16,
    marginBottom: 4,
    marginTop: 8,
  },
  bottomSection: {
    minHeight: 120,
  },
  errorBanner: {
    backgroundColor: '#fdecea',
    borderRadius: 8,
    padding: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
  },
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
    lineHeight: 30,
    fontWeight: '300',
  },
});
