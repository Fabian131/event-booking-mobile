import { renderHook, act } from '@testing-library/react-native';
import { useReservationsCalendar } from '@/src/hooks/useReservationsCalendar';
import { reservationsService } from '@/src/services/reservations';
import { ApiError } from '@/src/types/auth';
import { ERRORS, RESERVATIONS } from '@/src/constants/ui';
import type { CalendarDatesResponse } from '@/src/types/events';
import type { ReservationListResponse } from '@/src/types/reservations';

jest.mock('@/src/services/reservations');

const mockCalendarResponse: CalendarDatesResponse = {
  data: [
    { date: '2026-06-10', count: 1 },
    { date: '2026-06-15', count: 2 },
  ],
  year: 2026,
  month: 6,
};

const mockReservationsResponse: ReservationListResponse = {
  data: [
    {
      id: 'r1',
      user_id: 'u1',
      event_id: 'e1',
      event_title: 'Afternoon Show',
      event_date: '2026-06-15',
      event_start_time: '14:00:00',
      event_end_time: '16:00:00',
      ticket_quantity: 2,
      status: 'CONFIRMED',
      notes: null,
      user: { user_id: 'u1', user_name: 'Jane', user_email: 'jane@test.com' },
      created_at: '2026-06-01T00:00:00Z',
      updated_at: '2026-06-01T00:00:00Z',
    },
    {
      id: 'r2',
      user_id: 'u1',
      event_id: 'e2',
      event_title: 'Morning Yoga',
      event_date: '2026-06-15',
      event_start_time: '08:00:00',
      event_end_time: '09:00:00',
      ticket_quantity: 1,
      status: 'CONFIRMED',
      notes: null,
      user: { user_id: 'u1', user_name: 'Jane', user_email: 'jane@test.com' },
      created_at: '2026-06-01T00:00:00Z',
      updated_at: '2026-06-01T00:00:00Z',
    },
  ],
  pagination: { page: 1, limit: 50, total: 2, total_pages: 1, has_next_page: false },
};

describe('useReservationsCalendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch calendar dates on mount', async () => {
    (reservationsService.getCalendarDates as jest.Mock).mockResolvedValue(mockCalendarResponse);

    const { result } = renderHook(() => useReservationsCalendar());

    await act(async () => {
      await Promise.resolve();
    });

    expect(reservationsService.getCalendarDates).toHaveBeenCalled();
    expect(result.current.calendarDates).toEqual(mockCalendarResponse.data);
    expect(result.current.calendarLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set error when calendar fetch fails', async () => {
    (reservationsService.getCalendarDates as jest.Mock).mockRejectedValue(new Error('Network'));

    const { result } = renderHook(() => useReservationsCalendar());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.calendarLoading).toBe(false);
    expect(result.current.error).toBe(ERRORS.CALENDAR_LOAD_ERROR);
  });

  it('should fetch reservations by date and sort chronologically', async () => {
    (reservationsService.getCalendarDates as jest.Mock).mockResolvedValue(mockCalendarResponse);
    (reservationsService.list as jest.Mock).mockResolvedValue(mockReservationsResponse);

    const { result } = renderHook(() => useReservationsCalendar());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      result.current.selectDate('2026-06-15');
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(reservationsService.list).toHaveBeenCalledWith({ date: '2026-06-15' });
    expect(result.current.selectedDate).toBe('2026-06-15');
    expect(result.current.dayReservations).toHaveLength(2);
    expect(result.current.dayReservations[0].event_title).toBe('Morning Yoga');
    expect(result.current.dayReservations[1].event_title).toBe('Afternoon Show');
    expect(result.current.error).toBeNull();
  });

  it('should set error when reservation list fetch fails', async () => {
    (reservationsService.getCalendarDates as jest.Mock).mockResolvedValue(mockCalendarResponse);
    (reservationsService.list as jest.Mock).mockRejectedValue(new Error('Network'));

    const { result } = renderHook(() => useReservationsCalendar());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      result.current.selectDate('2026-06-15');
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.reservationsLoading).toBe(false);
    expect(result.current.error).toBe(ERRORS.CALENDAR_RESERVATIONS_ERROR);
  });

  it('should clear selectedDate and dayReservations on month change', async () => {
    (reservationsService.getCalendarDates as jest.Mock).mockResolvedValue(mockCalendarResponse);
    (reservationsService.list as jest.Mock).mockResolvedValue(mockReservationsResponse);

    const { result } = renderHook(() => useReservationsCalendar());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      result.current.selectDate('2026-06-15');
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.selectedDate).toBe('2026-06-15');
    expect(result.current.dayReservations).toHaveLength(2);

    await act(async () => {
      result.current.onMonthChange(7);
    });

    expect(result.current.selectedDate).toBeNull();
    expect(result.current.dayReservations).toEqual([]);
    expect(result.current.currentMonth).toBe(7);
  });

  it('should clear selectedDate and dayReservations on year change', async () => {
    (reservationsService.getCalendarDates as jest.Mock).mockResolvedValue(mockCalendarResponse);
    (reservationsService.list as jest.Mock).mockResolvedValue(mockReservationsResponse);

    const { result } = renderHook(() => useReservationsCalendar());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      result.current.selectDate('2026-06-15');
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.selectedDate).toBe('2026-06-15');

    await act(async () => {
      result.current.onYearChange(2027);
    });

    expect(result.current.selectedDate).toBeNull();
    expect(result.current.dayReservations).toEqual([]);
    expect(result.current.currentYear).toBe(2027);
  });

  describe('cancelReservation', () => {
    beforeEach(async () => {
      (reservationsService.getCalendarDates as jest.Mock).mockResolvedValue(mockCalendarResponse);
      (reservationsService.list as jest.Mock).mockResolvedValue(mockReservationsResponse);
    });

    async function setupWithReservations() {
      const hook = renderHook(() => useReservationsCalendar());
      await act(async () => { await Promise.resolve(); });
      await act(async () => { hook.result.current.selectDate('2026-06-15'); });
      await act(async () => { await Promise.resolve(); });
      return hook;
    }

    it('should have cancellingId null when idle and after operations complete', async () => {
      (reservationsService.cancel as jest.Mock).mockResolvedValue({});

      const { result } = await setupWithReservations();

      expect(result.current.cancellingId).toBeNull();

      await act(async () => {
        await result.current.cancelReservation('r1');
      });

      expect(result.current.cancellingId).toBeNull();

      const apiError = new ApiError('fail', 400);
      (reservationsService.cancel as jest.Mock).mockRejectedValue(apiError);

      await act(async () => {
        await result.current.cancelReservation('r2');
      });

      expect(result.current.cancellingId).toBeNull();
    });

    it('should update reservation status to CANCELLED on success', async () => {
      (reservationsService.cancel as jest.Mock).mockResolvedValue({});

      const { result } = await setupWithReservations();

      await act(async () => {
        await result.current.cancelReservation('r1');
      });

      const cancelled = result.current.dayReservations.find((r) => r.id === 'r1');
      expect(cancelled?.status).toBe('CANCELLED');
    });

    it('should only cancel the targeted reservation', async () => {
      (reservationsService.cancel as jest.Mock).mockResolvedValue({});

      const { result } = await setupWithReservations();

      await act(async () => {
        await result.current.cancelReservation('r1');
      });

      const r1 = result.current.dayReservations.find((r) => r.id === 'r1');
      const r2 = result.current.dayReservations.find((r) => r.id === 'r2');
      expect(r1?.status).toBe('CANCELLED');
      expect(r2?.status).toBe('CONFIRMED');
    });

    it('should refresh calendar dates after successful cancel', async () => {
      (reservationsService.cancel as jest.Mock).mockResolvedValue({});
      (reservationsService.getCalendarDates as jest.Mock).mockClear();

      const { result } = await setupWithReservations();

      await act(async () => {
        await result.current.cancelReservation('r1');
      });

      expect(reservationsService.getCalendarDates).toHaveBeenCalled();
    });

    it('should set localized error on 400 ApiError (already cancelled)', async () => {
      const apiError = new ApiError('This reservation has already been cancelled', 400);
      (reservationsService.cancel as jest.Mock).mockRejectedValue(apiError);

      const { result } = await setupWithReservations();

      await act(async () => {
        await result.current.cancelReservation('r1');
      });

      expect(result.current.error).toBe(RESERVATIONS.CANCEL_ALREADY_CANCELLED);
      expect(result.current.cancellingId).toBeNull();
    });

    it('should set error message from ApiError for non-400/404 statuses', async () => {
      const apiError = new ApiError('Server exploded', 500);
      (reservationsService.cancel as jest.Mock).mockRejectedValue(apiError);

      const { result } = await setupWithReservations();

      await act(async () => {
        await result.current.cancelReservation('r1');
      });

      expect(result.current.error).toBe('Server exploded');
      expect(result.current.cancellingId).toBeNull();
    });

    it('should set error on TypeError (network) and clear cancellingId', async () => {
      (reservationsService.cancel as jest.Mock).mockRejectedValue(new TypeError('Network request failed'));

      const { result } = await setupWithReservations();

      await act(async () => {
        await result.current.cancelReservation('r1');
      });

      expect(result.current.error).toBe(ERRORS.NETWORK);
      expect(result.current.cancellingId).toBeNull();
    });

    it('should set localized error on 404 ApiError', async () => {
      const apiError = new ApiError('Reservation not found', 404);
      (reservationsService.cancel as jest.Mock).mockRejectedValue(apiError);

      const { result } = await setupWithReservations();

      await act(async () => {
        await result.current.cancelReservation('r1');
      });

      expect(result.current.error).toBe(RESERVATIONS.CANCEL_NOT_FOUND);
      expect(result.current.cancellingId).toBeNull();
    });

    it('should return false and not update status on empty reservationId', async () => {
      (reservationsService.cancel as jest.Mock).mockResolvedValue({});

      const { result } = await setupWithReservations();

      let returnedValue: boolean | undefined;
      await act(async () => {
        returnedValue = await result.current.cancelReservation('');
      });

      expect(returnedValue).toBe(false);
      expect(reservationsService.cancel).not.toHaveBeenCalled();
      expect(result.current.cancellingId).toBeNull();
    });

    it('should set fallback error on generic error and clear cancellingId', async () => {
      (reservationsService.cancel as jest.Mock).mockRejectedValue(new Error('Something broke'));

      const { result } = await setupWithReservations();

      await act(async () => {
        await result.current.cancelReservation('r1');
      });

      expect(result.current.error).toBe(RESERVATIONS.CANCEL_ERROR);
      expect(result.current.cancellingId).toBeNull();
    });

    it('should clear previous error before attempting cancel', async () => {
      const apiError = new ApiError('First error', 500);
      (reservationsService.cancel as jest.Mock).mockRejectedValueOnce(apiError);
      (reservationsService.cancel as jest.Mock).mockResolvedValueOnce({});

      const { result } = await setupWithReservations();

      await act(async () => {
        await result.current.cancelReservation('r1');
      });
      expect(result.current.error).toBe('First error');

      await act(async () => {
        await result.current.cancelReservation('r2');
      });
      expect(result.current.error).toBeNull();
    });

    it('should return true on success and false on failure', async () => {
      (reservationsService.cancel as jest.Mock).mockResolvedValueOnce({});
      (reservationsService.cancel as jest.Mock).mockRejectedValueOnce(new Error('fail'));

      const { result } = await setupWithReservations();

      let successResult: boolean | undefined;
      let failResult: boolean | undefined;

      await act(async () => {
        successResult = await result.current.cancelReservation('r1');
      });
      await act(async () => {
        failResult = await result.current.cancelReservation('r2');
      });

      expect(successResult).toBe(true);
      expect(failResult).toBe(false);
    });

    it('should preserve CANCELLED status after calendar refresh', async () => {
      (reservationsService.cancel as jest.Mock).mockResolvedValue({});

      const { result } = await setupWithReservations();

      await act(async () => {
        await result.current.cancelReservation('r1');
      });

      const cancelled = result.current.dayReservations.find((r) => r.id === 'r1');
      expect(cancelled?.status).toBe('CANCELLED');

      expect(result.current.dayReservations.length).toBeGreaterThanOrEqual(2);
    });
  });
});
