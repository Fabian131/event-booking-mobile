import { useState, useEffect, useCallback } from 'react';
import { eventsService } from '@/src/services/events';
import { getTodayYear, getTodayMonth } from '@/src/utils/dateHelpers';
import type { CalendarDateItem, EventSummary } from '@/src/types/events';
import { ERRORS } from '@/src/constants/ui';

interface UseCalendarEventsReturn {
  calendarDates: CalendarDateItem[];
  dayEvents: EventSummary[];
  selectedDate: string | null;
  currentYear: number;
  currentMonth: number;
  calendarLoading: boolean;
  eventsLoading: boolean;
  error: string | null;
  selectDate: (date: string) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export function useCalendarEvents(): UseCalendarEventsReturn {
  const [currentYear, setCurrentYear] = useState(getTodayYear());
  const [currentMonth, setCurrentMonth] = useState(getTodayMonth());
  const [calendarDates, setCalendarDates] = useState<CalendarDateItem[]>([]);
  const [dayEvents, setDayEvents] = useState<EventSummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarDates = useCallback(async (year: number, month: number) => {
    setCalendarLoading(true);
    try {
      const response = await eventsService.getCalendarDates(year, month);
      setCalendarDates(response.data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError(ERRORS.CALENDAR_LOAD_ERROR);
    } finally {
      setCalendarLoading(false);
    }
  }, []);

  const fetchEventsByDate = useCallback(async (date: string) => {
    setEventsLoading(true);
    try {
      const response = await eventsService.getEventsByDate(date);
      const chronologicalEvents = [...response.data].sort((a, b) =>
        a.start_time.localeCompare(b.start_time),
      );
      setDayEvents(chronologicalEvents);
      setError(null);
    } catch (e) {
      console.error(e);
      setError(ERRORS.CALENDAR_EVENTS_ERROR);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarDates(currentYear, currentMonth);
  }, [currentYear, currentMonth, fetchCalendarDates]);

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date);
    fetchEventsByDate(date);
  }, [fetchEventsByDate]);

  const onMonthChange = useCallback((month: number) => {
    setSelectedDate(null);
    setDayEvents([]);
    setCurrentMonth(month);
  }, []);

  const onYearChange = useCallback((year: number) => {
    setSelectedDate(null);
    setDayEvents([]);
    setCurrentYear(year);
  }, []);

  return {
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
  };
}
