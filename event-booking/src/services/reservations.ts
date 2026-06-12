import { api } from './api';
import type {
  CreateReservationRequest,
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
    return api.get<ReservationListResponse>(`/api/v1/reservations?${query}`);
  },

  cancel(reservationId: string): Promise<Reservation> {
    return api.patch<Reservation>(`/api/v1/reservations/${reservationId}/cancel`);
  },

  create(data: CreateReservationRequest): Promise<Reservation> {
    return api.post<Reservation>('/api/v1/reservations', data);
  },
};
