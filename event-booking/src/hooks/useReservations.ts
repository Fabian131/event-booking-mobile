import { useCallback, useRef, useState } from 'react';
import { ApiError } from '@/src/types/auth';
import type { Reservation } from '@/src/types/reservations';
import { reservationsService } from '@/src/services/reservations';
import { RESERVATIONS, ERRORS } from '@/src/constants/ui';

export function useReservations(eventId: string) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadReservations = useCallback(async (searchQuery: string) => {
    if (!eventId) return;

    const currentRequestId = ++requestIdRef.current;
    setError(null);
    setLoading(true);

    try {
      const response = await reservationsService.list({
        event_id: eventId,
        search: searchQuery || undefined,
        status: 'CONFIRMED',
        limit: 100,
      });

      if (currentRequestId !== requestIdRef.current) return;

      setReservations(response.data);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;

      __DEV__ && console.log('[useReservations] Error:', err);

      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof DOMException && err.name === 'AbortError') {
        setError(ERRORS.NETWORK);
      } else if (err instanceof TypeError) {
        setError(ERRORS.NETWORK);
      } else {
        setError(RESERVATIONS.LIST_ERROR);
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
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
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof TypeError) {
        setError(ERRORS.NETWORK);
      } else {
        setError(RESERVATIONS.CANCEL_ERROR);
      }
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
