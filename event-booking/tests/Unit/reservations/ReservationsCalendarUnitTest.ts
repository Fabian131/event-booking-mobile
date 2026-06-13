import { renderHook, act } from '@testing-library/react-native';
import { useReservationsCalendar } from '@/src/hooks/useReservationsCalendar';
import { reservationsService } from '@/src/services/reservations';
import { ERRORS } from '@/src/constants/ui';
import type { CalendarDatesResponse } from '@/src/types/events';
import type { ReservationListResponse } from '@/src/types/reservations';

jest.mock('@/src/services/reservations');
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return RN;
});

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
    },
    {
      id: 'r2',
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
});
