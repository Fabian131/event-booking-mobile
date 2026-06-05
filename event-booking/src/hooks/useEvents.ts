import { useState, useEffect, useCallback } from 'react';
import { eventService } from '@/src/services/event';
import { getTodayYear, getTodayMonth } from '@/src/utils/dateHelpers';
import type { CalendarDateItem, EventSummary } from '@/src/types/event';

interface UseEventsReturn {
  calendarDates: CalendarDateItem[];
  dayEvents: EventSummary[];
  selectedDate: string | null;
  currentYear: number;
  currentMonth: number;
  loading: boolean;
  error: string | null;
  selectDate: (date: string) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
}

export function useEvents(): UseEventsReturn {
  const [currentYear, setCurrentYear] = useState(getTodayYear());
  const [currentMonth, setCurrentMonth] = useState(getTodayMonth());
  const [calendarDates, setCalendarDates] = useState<CalendarDateItem[]>([]);
  const [dayEvents, setDayEvents] = useState<EventSummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarDates = useCallback(async (year: number, month: number) => {
    try {
      const response = await eventService.getCalendarDates(year, month);
      setCalendarDates(response.data);
      setError(null);
    } catch {
      setCalendarDates([]);
      setError('No se pudo cargar el calendario.');
    }
  }, []);

  const fetchEventsByDate = useCallback(async (date: string) => {
    try {
      setLoading(true);
      const response = await eventService.getEventsByDate(date);
      setDayEvents(response.data);
      setError(null);
    } catch {
      setDayEvents([]);
      setError('No se pudieron cargar los eventos del día.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarDates(currentYear, currentMonth);
  }, [currentYear, currentMonth, fetchCalendarDates]);

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date);
    fetchEventsByDate(date);
  }, [fetchEventsByDate]);

  const goToPreviousMonth = useCallback(() => {
    setSelectedDate(null);
    setDayEvents([]);
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    setSelectedDate(null);
    setDayEvents([]);
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }, [currentMonth]);

  return {
    calendarDates,
    dayEvents,
    selectedDate,
    currentYear,
    currentMonth,
    loading,
    error,
    selectDate,
    goToPreviousMonth,
    goToNextMonth,
  };
}
