import { useState, useEffect, useCallback } from 'react';
import { reservationsService } from '@/src/services/reservations';
import { getTodayYear, getTodayMonth } from '@/src/utils/dateHelpers';
import type { CalendarDateItem } from '@/src/types/events';
import type { ReservationSummary } from '@/src/types/reservations';
import { ERRORS } from '@/src/constants/ui';

interface UseReservationsCalendarReturn {
  calendarDates: CalendarDateItem[];
  dayReservations: ReservationSummary[];
  selectedDate: string | null;
  currentYear: number;
  currentMonth: number;
  calendarLoading: boolean;
  reservationsLoading: boolean;
  error: string | null;
  selectDate: (date: string) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  refresh: () => void;
}

export function useReservationsCalendar(): UseReservationsCalendarReturn {
  const [currentYear, setCurrentYear] = useState(getTodayYear());
  const [currentMonth, setCurrentMonth] = useState(getTodayMonth());
  const [calendarDates, setCalendarDates] = useState<CalendarDateItem[]>([]);
  const [dayReservations, setDayReservations] = useState<ReservationSummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarDates = useCallback(async (year: number, month: number) => {
    setCalendarLoading(true);
    try {
      const response = await reservationsService.getCalendarDates(year, month);
      setCalendarDates(response.data);
      setError(null);
    } catch {
      setError(ERRORS.CALENDAR_LOAD_ERROR);
    } finally {
      setCalendarLoading(false);
    }
  }, []);

  const fetchReservationsByDate = useCallback(async (date: string) => {
    setReservationsLoading(true);
    try {
      const response = await reservationsService.list({ date });
      const chronological = [...response.data].sort((a, b) =>
        a.event_start_time.localeCompare(b.event_start_time),
      );
      setDayReservations(chronological);
      setError(null);
    } catch {
      setError(ERRORS.CALENDAR_RESERVATIONS_ERROR);
    } finally {
      setReservationsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarDates(currentYear, currentMonth);
  }, [currentYear, currentMonth, fetchCalendarDates]);

  const refresh = useCallback(() => {
    fetchCalendarDates(currentYear, currentMonth);
    if (selectedDate) {
      fetchReservationsByDate(selectedDate);
    }
  }, [currentYear, currentMonth, selectedDate, fetchCalendarDates, fetchReservationsByDate]);

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date);
    fetchReservationsByDate(date);
  }, [fetchReservationsByDate]);

  const onMonthChange = useCallback((month: number) => {
    setSelectedDate(null);
    setDayReservations([]);
    setCurrentMonth(month);
  }, []);

  const onYearChange = useCallback((year: number) => {
    setSelectedDate(null);
    setDayReservations([]);
    setCurrentYear(year);
  }, []);

  return {
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
  };
}
