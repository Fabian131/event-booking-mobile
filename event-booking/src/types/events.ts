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

export interface Event {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  max_capacity: number;
  remaining_capacity: number;
  category: EventCategory;
  date: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
}

export interface EventsListResponse {
  data: Event[];
  pagination: PaginationMeta;
}

export interface EventsListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: EventCategory;
  is_active?: boolean;
  date?: string;
}

// ── Calendar dashboard types ───────────────────────────────────────────────

/** Alias for the admin dashboard calendar (mirrors Event for the day list). */
export type EventSummary = Event;

export interface CalendarDateItem {
  date: string;
  count: number;
}

export interface CalendarDatesResponse {
  data: CalendarDateItem[];
  year: number;
  month: number;
}

export interface DayCell {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  eventCount: number;
}

