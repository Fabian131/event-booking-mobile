import { api } from './api';
import type { Event, EventsListParams, EventsListResponse } from '@/src/types/events';

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

  getById(id: string): Promise<Event> {
    return api.get<Event>(`/api/v1/events/${id}`);
  },

  create(formData: FormData): Promise<Event> {
    return api.postForm<Event>('/api/v1/events', formData);
  },

  update(id: string, formData: FormData): Promise<Event> {
    return api.putForm<Event>(`/api/v1/events/${id}`, formData);
  },
};
