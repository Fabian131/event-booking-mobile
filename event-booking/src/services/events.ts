import { api } from './api';
import type { EventSummary, EventsListParams, EventsListResponse } from '@/src/types/events';

export const eventsService = {
  list(params: EventsListParams = {}): Promise<EventsListResponse> {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
      ...(params.search ? { search: params.search } : {}),
      ...(params.category ? { category: params.category } : {}),
      ...(params.is_active !== undefined ? { is_active: String(params.is_active) } : {}),
      ...(params.date ? { date: params.date } : {}),
    });
    return api.get<EventsListResponse>(`/api/v1/events?${query}`);
  },

  getById(id: string): Promise<EventSummary> {
    return api.get<EventSummary>(`/api/v1/events/${id}`);
  },
};
