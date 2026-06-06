import { api } from './api';
import type { EventsListParams, EventsListResponse } from '@/src/types/events';

export const eventsService = {
  list(params: EventsListParams = {}): Promise<EventsListResponse> {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
      ...(params.search ? { search: params.search } : {}),
      ...(params.category ? { category: params.category } : {}),
    });
    return api.get<EventsListResponse>(`/api/v1/events?${query}`);
  },
};
