import { api } from './api';
import type {
  CreateReservationRequest,
  Reservation,
  ReservationListParams,
  ReservationListResponse,
} from '@/src/types/reservations';
import type { CalendarDatesResponse } from '@/src/types/events';

export const reservationsService = {
  list(params: ReservationListParams): Promise<ReservationListResponse> {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
    });
    if (params.event_id) query.append('event_id', params.event_id);
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.date) query.append('date', params.date);

    return api.get<ReservationListResponse>(`/api/v1/reservations?${query}`);
  },

  cancel(reservationId: string): Promise<Reservation> {
    return api.patch<Reservation>(`/api/v1/reservations/${reservationId}/cancel`);
  },

  create(data: CreateReservationRequest): Promise<Reservation> {
    return api.post<Reservation>('/api/v1/reservations', data);
  },

  getCalendarDates(year: number, month: number): Promise<CalendarDatesResponse> {
    return api.get<CalendarDatesResponse>(
      `/api/v1/reservations/calendar?year=${year}&month=${month}`,
    );
  },
};
