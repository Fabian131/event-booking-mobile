import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/src/types/auth';
import type { Event, EventsListParams } from '@/src/types/events';
import { eventsService } from '@/src/services/events';
import { ERRORS } from '@/src/constants/ui';

const PAGE_LIMIT = 20;

export type UseEventsFilters = Pick<EventsListParams, 'search' | 'category' | 'date'>;

export function useEvents(filters: UseEventsFilters = {}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const paginationFetchingRef = useRef(false);
  const requestIdRef = useRef(0);

  const search = filters.search?.trim() || undefined;
  const category = filters.category;
  const date = filters.date || undefined;

  const loadEvents = useCallback(async (page: number, reset: boolean) => {
    if (!reset && paginationFetchingRef.current) return;

    const requestId = ++requestIdRef.current;
    setError(null);

    if (!reset) {
      paginationFetchingRef.current = true;
      setLoading(true); // Pagination
    }

    try {
      const response = await eventsService.list({
        page,
        limit: PAGE_LIMIT,
        ...(search ? { search } : {}),
        ...(category ? { category } : {}),
        ...(date ? { date } : {}),
      });

      if (requestId !== requestIdRef.current) return;

      setEvents((prev) => (reset ? response.data : [...prev, ...response.data]));
      setHasNextPage(response.pagination.has_next_page);
      setCurrentPage(response.pagination.page);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      const message = err instanceof ApiError ? err.message : ERRORS.EVENTS_LOAD_ERROR;
      setError(message);
    } finally {
      if (!reset) {
        paginationFetchingRef.current = false;
      }

      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [category, date, search]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    loadEvents(1, true);
  }, [loadEvents]);

  const loadMore = useCallback(() => {
    if (!hasNextPage || loading || refreshing) return;
    loadEvents(currentPage + 1, false);
  }, [hasNextPage, loading, refreshing, currentPage, loadEvents]);

  useEffect(() => {
    setEvents([]);
    setHasNextPage(false);
    setCurrentPage(1);
    setLoading(true);
    loadEvents(1, true);
  }, [loadEvents]);

  return { events, loading, refreshing, error, hasNextPage, loadMore, refresh };
}
