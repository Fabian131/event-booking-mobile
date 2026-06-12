import { api } from './api';
import type { CreateReservationRequest, ReservationResponse } from '@/src/types/reservations';

export const reservationsService = {
  create(data: CreateReservationRequest): Promise<ReservationResponse> {
    return api.post<ReservationResponse>('/api/v1/reservations', data);
  },
};
