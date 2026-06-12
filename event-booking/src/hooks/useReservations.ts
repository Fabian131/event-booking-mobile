import { useCallback, useRef, useState } from 'react';
import { ApiError } from '@/src/types/auth';
import type { Reservation } from '@/src/types/reservations';
import { reservationsService } from '@/src/services/reservations';
import { RESERVATIONS } from '@/src/constants/ui';

export function useReservations(eventId: string) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchingRef = useRef(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadReservations = useCallback(async (searchQuery: string) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setError(null);
    setLoading(true);

    try {
      const response = await reservationsService.list({
        event_id: eventId,
        search: searchQuery || undefined,
        status: 'CONFIRMED',
        limit: 100,
      });
      setReservations(response.data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : RESERVATIONS.LIST_ERROR;
      setError(message);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [eventId]);

  const onSearchChange = useCallback((text: string) => {
    setSearch(text);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      loadReservations(text);
    }, 300);
  }, [loadReservations]);

  const cancelReservation = useCallback(async (reservationId: string): Promise<boolean> => {
    setCancellingId(reservationId);
    setError(null);
    try {
      await reservationsService.cancel(reservationId);
      setReservations((prev) => prev.filter((r) => r.id !== reservationId));
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : RESERVATIONS.CANCEL_ERROR;
      setError(message);
      return false;
    } finally {
      setCancellingId(null);
    }
  }, []);

  return {
    reservations,
    loading,
    error,
    search,
    cancellingId,
    onSearchChange,
    cancelReservation,
    loadReservations,
  };
}
