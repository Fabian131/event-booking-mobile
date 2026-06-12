import { useRef, useCallback } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { Calendar } from '@/src/components/domain/Calendar';
import { ReservationCard } from '@/src/components/domain/ReservationCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Loader } from '@/src/components/ui/Loader';
import { useReservationsCalendar } from '@/src/hooks/useReservationsCalendar';
import { CUSTOMER } from '@/src/constants/ui';

export default function CustomerReservationsScreen() {
  const {
    calendarDates,
    dayReservations,
    selectedDate,
    currentYear,
    currentMonth,
    calendarLoading,
    reservationsLoading,
    error,
    selectDate,
    onMonthChange,
    onYearChange,
    refresh,
  } = useReservationsCalendar();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

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

  const renderReservationList = () => {
    if (!selectedDate) {
      return (
        <EmptyState
          title={CUSTOMER.RESERVATIONS_EMPTY_TITLE}
          subtitle={CUSTOMER.RESERVATIONS_EMPTY_SUBTITLE}
        />
      );
    }
    if (reservationsLoading) {
      return <Loader message={CUSTOMER.RESERVATIONS_LOADING} />;
    }
    if (error) {
      return (
        <View style={styles.errorBanner}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      );
    }
    if (dayReservations.length === 0) {
      return (
        <EmptyState
          title={CUSTOMER.RESERVATIONS_NO_RESERVATIONS_TITLE}
          subtitle={CUSTOMER.RESERVATIONS_NO_RESERVATIONS_SUBTITLE}
        />
      );
    }
    return (
      <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
        {dayReservations.map((reservation) => (
          <ReservationCard key={reservation.id} reservation={reservation} />
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

        <View style={styles.reservationsSection}>
          <ThemedText style={styles.sectionTitle}>
            {selectedDate
              ? `${CUSTOMER.RESERVATIONS_FOR_DAY} ${selectedDate}`
              : CUSTOMER.RESERVATIONS_HEADING}
          </ThemedText>
          {renderReservationList()}
          <View style={styles.bottomSection} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 100,
  },
  calendarSection: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  reservationsSection: {
    marginTop: 16,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#687076',
    fontWeight: '500',
    marginBottom: 8,
  },
  bottomSection: {
    minHeight: 120,
  },
  errorBanner: {
    backgroundColor: '#fdecea',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
  },
});
