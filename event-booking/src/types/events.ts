export type EventCategory =
  | 'sports'
  | 'music'
  | 'culture'
  | 'gastronomy'
  | 'wellness'
  | 'education'
  | 'other';

export interface EventSummary {
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
  data: EventSummary[];
  pagination: PaginationMeta;
}

export interface EventsListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: EventCategory;
}
