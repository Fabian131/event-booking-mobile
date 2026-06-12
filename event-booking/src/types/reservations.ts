export type ReservationStatus = 'CONFIRMED' | 'CANCELLED';

export interface ReservationUserContext {
  user_id: string;
  user_name: string;
  user_email: string;
}

export interface CreateReservationRequest {
  event_id: string;
  ticket_quantity: number;
  notes?: string;
}

export interface ReservationResponse {
  id: string;
  user_id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_start_time: string;
  event_end_time: string;
  ticket_quantity: number;
  status: ReservationStatus;
  notes: string | null;
  user: ReservationUserContext;
  created_at: string;
  updated_at: string;
}

export interface ReservationSummary {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_start_time: string;
  event_end_time: string;
  ticket_quantity: number;
  status: ReservationStatus;
  notes: string | null;
  user: ReservationUserContext;
  created_at: string;
}

export interface ReservationsListParams {
  page?: number;
  limit?: number;
  date?: string;
  status?: ReservationStatus;
}

export interface PaginatedReservationsResponse {
  data: ReservationSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
  };
}
