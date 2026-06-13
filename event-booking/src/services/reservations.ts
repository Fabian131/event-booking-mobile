import { api } from './api';
import type {
  //copnflicto
  CreateReservationRequest,
  ReservationResponse,
  ReservationsListParams,
  PaginatedReservationsResponse,
} from '@/src/types/reservations';
import type { CalendarDatesResponse } from '@/src/types/events';
  Reservation,
  ReservationListParams,
  ReservationListResponse,
} from '@/src/types/reservations';

export const reservationsService = {
  list(params: ReservationListParams): Promise<ReservationListResponse> {
    const query = new URLSearchParams({
      event_id: params.event_id,
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
    });
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);

    const url = `/api/v1/reservations?${query}`;
    return api.get<ReservationListResponse>(url);
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
