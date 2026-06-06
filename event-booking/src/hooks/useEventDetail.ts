import { useEffect, useState } from 'react';
import { ApiError } from '@/src/types/auth';
import type { Event } from '@/src/types/events';
import { eventsService } from '@/src/services/events';

export function useEventDetail(id: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await eventsService.getById(id);
        if (mounted) setEvent(data);
      } catch (err) {
        if (mounted) {
          const message = err instanceof ApiError ? err.message : 'Error al cargar el evento';
          setError(message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [id]);

  return { event, loading, error };
}
