export type EventCategory = 'sports' | 'music' | 'culture' | 'gastronomy' | 'wellness' | 'education' | 'other';

export interface EventSummary {
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
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
}

export interface PaginatedEventsResponse {
  data: EventSummary[];
  pagination: PaginationMeta;
}

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
