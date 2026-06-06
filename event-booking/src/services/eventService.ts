import type { EventResponse } from '@/src/types/event';
import { api } from './api';

export const eventService = {
  createEvent(formData: FormData): Promise<EventResponse> {
    return api.postForm<EventResponse>('/api/v1/events', formData);
  },
};
