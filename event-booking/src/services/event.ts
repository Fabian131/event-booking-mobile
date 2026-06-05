import { api } from './api';
import type {
  PaginatedEventsResponse,
  CalendarDatesResponse,
} from '@/src/types/event';

export const eventService = {
  getCalendarDates(year: number, month: number): Promise<CalendarDatesResponse> {
    return api.get<CalendarDatesResponse>(
      `/api/v1/events/calendar?year=${year}&month=${month}`,
    );
  },

  getEventsByDate(date: string): Promise<PaginatedEventsResponse> {
    return api.get<PaginatedEventsResponse>(
      `/api/v1/events?date=${date}`,
    );
  },
};
