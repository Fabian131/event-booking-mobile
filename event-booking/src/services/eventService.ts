import { api } from './api';

export const eventService = {
  createEvent(formData: FormData): Promise<any> {
    return api.postForm('/api/v1/events', formData);
  },
};
