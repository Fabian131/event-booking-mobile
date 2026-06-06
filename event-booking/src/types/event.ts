export interface EventResponse {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  max_capacity: number;
  remaining_capacity: number;
  category: string;
  date: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const EVENT_CATEGORIES = [
  'sports',
  'music',
  'culture',
  'gastronomy',
  'wellness',
  'education',
  'other',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
