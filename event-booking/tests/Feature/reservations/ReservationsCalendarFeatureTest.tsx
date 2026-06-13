import { act, render, screen } from '@testing-library/react-native';
import CustomerReservationsScreen from '@/app/(customer)/reservations';
import type { CalendarDateItem } from '@/src/types/events';
import { CUSTOMER } from '@/src/constants/ui';

const mockCalendarDates: CalendarDateItem[] = [
  { date: '2026-06-15', count: 1 },
  { date: '2026-06-20', count: 3 },
];

jest.mock('@/src/hooks/useReservationsCalendar', () => ({
  useReservationsCalendar: () => ({
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
  }),
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
  const { View, Text, Pressable } = require('react-native');

  const MockDateTimePicker = () =>
    React.createElement(View, { testID: 'datetime-picker' },
      React.createElement(Text, null, 'Calendar'),
      React.createElement(Pressable, {
        testID: 'mock-day-press',
      }, React.createElement(Text, null, 'Day 15')),
    );

  const useDefaultStyles = () => ({});

  return {
    __esModule: true,
    default: MockDateTimePicker,
    useDefaultStyles,
  };
});

describe('Reservations Calendar Screen', () => {
  it('should render calendar and empty state when no date selected', async () => {
    render(<CustomerReservationsScreen />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('Calendar')).toBeTruthy();
    expect(screen.getByText(CUSTOMER.RESERVATIONS_EMPTY_TITLE)).toBeTruthy();
    expect(screen.getByText(CUSTOMER.RESERVATIONS_EMPTY_SUBTITLE)).toBeTruthy();
  });
});
