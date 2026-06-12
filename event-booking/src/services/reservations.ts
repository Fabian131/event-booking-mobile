import { api } from './api';
import type {
  CreateReservationRequest,
  ReservationResponse,
  ReservationsListParams,
  PaginatedReservationsResponse,
} from '@/src/types/reservations';
import type { CalendarDatesResponse } from '@/src/types/events';

export const reservationsService = {
  create(data: CreateReservationRequest): Promise<ReservationResponse> {
    return api.post<ReservationResponse>('/api/v1/reservations', data);
  },

  getCalendarDates(year: number, month: number): Promise<CalendarDatesResponse> {
    return api.get<CalendarDatesResponse>(
      `/api/v1/reservations/calendar?year=${year}&month=${month}`,
    );
  },

  list(params: ReservationsListParams = {}): Promise<PaginatedReservationsResponse> {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 50),
      ...(params.date ? { date: params.date } : {}),
      ...(params.status ? { status: params.status } : {}),
    });
    return api.get<PaginatedReservationsResponse>(`/api/v1/reservations?${query}`);
  },
};
