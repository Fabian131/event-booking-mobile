import type { Event } from '@/src/types/events';
import { api } from './api';

export const eventService = {
  createEvent(formData: FormData): Promise<Event> {
    return api.postForm<Event>('/api/v1/events', formData);
  },
};
