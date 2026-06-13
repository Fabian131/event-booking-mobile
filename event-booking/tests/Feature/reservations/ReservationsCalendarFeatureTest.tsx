import { act, render, screen } from '@testing-library/react-native';
import CustomerReservationsScreen from '@/app/(customer)/reservations';
import { useReservationsCalendar } from '@/src/hooks/useReservationsCalendar';
import type { CalendarDateItem } from '@/src/types/events';
import type { ReservationSummary } from '@/src/types/reservations';
import { CUSTOMER } from '@/src/constants/ui';
import { ERRORS } from '@/src/constants/ui';

const mockCalendarDates: CalendarDateItem[] = [
  { date: '2026-06-15', count: 1 },
  { date: '2026-06-20', count: 3 },
];

const mockReservations: ReservationSummary[] = [
  {
    id: 'r1', event_id: 'e1', event_title: 'Summer Festival', event_date: '2026-06-15',
    event_start_time: '10:00:00', event_end_time: '18:00:00',
    ticket_quantity: 2, status: 'CONFIRMED', notes: null,
    user: { user_id: 'u1', user_name: 'Jane', user_email: 'jane@test.com' },
    created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'r2', event_id: 'e2', event_title: 'Cancelled Event', event_date: '2026-06-15',
    event_start_time: '14:00:00', event_end_time: '16:00:00',
    ticket_quantity: 1, status: 'CANCELLED', notes: 'Refund pending',
    user: { user_id: 'u1', user_name: 'Jane', user_email: 'jane@test.com' },
    created_at: '2026-06-01T00:00:00Z',
  },
];

function mockHook(overrides: Record<string, unknown> = {}) {
  (useReservationsCalendar as jest.Mock).mockReturnValue({
    calendarDates: mockCalendarDates,
    dayReservations: [],
    selectedDate: null,
    currentYear: 2026,
    currentMonth: 6,
    calendarLoading: false,
    reservationsLoading: false,
    error: null,
    selectDate: jest.fn(),
    onMonthChange: jest.fn(),
    onYearChange: jest.fn(),
    refresh: jest.fn(),
    ...overrides,
  });
}

jest.mock('@/src/hooks/useReservationsCalendar', () => ({
  useReservationsCalendar: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => (() => void) | void) => {
    const { useEffect } = require('react');
    useEffect(() => {
      const cleanup = cb();
      return cleanup;
    }, []);
  },
}));

jest.mock('react-native-ui-datepicker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  const MockDateTimePicker = () =>
    React.createElement(View, null,
      React.createElement(Text, null, 'Calendar'),
    );

  const useDefaultStyles = () => ({});

  return {
    __esModule: true,
    default: MockDateTimePicker,
    useDefaultStyles,
  };
});

describe('Reservations Calendar Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render calendar and empty state when no date selected', async () => {
    mockHook();
    render(<CustomerReservationsScreen />);
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByText('Calendar')).toBeTruthy();
    expect(screen.getByText(CUSTOMER.RESERVATIONS_EMPTY_TITLE)).toBeTruthy();
    expect(screen.getByText(CUSTOMER.RESERVATIONS_EMPTY_SUBTITLE)).toBeTruthy();
  });

  it('should render loading spinner when reservations are loading', async () => {
    mockHook({ selectedDate: '2026-06-15', reservationsLoading: true });
    render(<CustomerReservationsScreen />);
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByText(CUSTOMER.RESERVATIONS_LOADING)).toBeTruthy();
  });

  it('should render error banner when error is set', async () => {
    mockHook({ selectedDate: '2026-06-15', error: ERRORS.CALENDAR_LOAD_ERROR });
    render(<CustomerReservationsScreen />);
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByText(ERRORS.CALENDAR_LOAD_ERROR)).toBeTruthy();
  });

  it('should render empty state when date selected but no reservations', async () => {
    mockHook({ selectedDate: '2026-06-15' });
    render(<CustomerReservationsScreen />);
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByText(CUSTOMER.RESERVATIONS_NO_RESERVATIONS_TITLE)).toBeTruthy();
    expect(screen.getByText(CUSTOMER.RESERVATIONS_NO_RESERVATIONS_SUBTITLE)).toBeTruthy();
  });

  it('should render reservation cards when list has data', async () => {
    mockHook({ selectedDate: '2026-06-15', dayReservations: mockReservations });
    render(<CustomerReservationsScreen />);
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByText('Summer Festival')).toBeTruthy();
    expect(screen.getByText('Cancelled Event')).toBeTruthy();
  });
});
