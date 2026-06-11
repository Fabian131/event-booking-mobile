import { render, screen, waitFor } from '@testing-library/react-native';
import { eventsService } from '@/src/services/events';
import AdminCalendarScreen from '@/app/(admin)/index';

jest.mock('@/src/services/events');
jest.mock('@/src/hooks/useCalendarEvents', () => ({
  useCalendarEvents: () => ({
    calendarDates: [],
    dayEvents: [],
    selectedDate: null,
    currentYear: 2026,
    currentMonth: 6,
    calendarLoading: false,
    eventsLoading: false,
    error: null,
    selectDate: jest.fn(),
    onMonthChange: jest.fn(),
    onYearChange: jest.fn(),
  }),
}));
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('react-native-ui-datepicker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  const MockDateTimePicker = () =>
    React.createElement(View, { testID: 'datetime-picker' },
      React.createElement(Text, null, 'DateTimePicker'),
    );

  const useDefaultStyles = () => ({
    today: {},
    selected: {},
    selected_label: {},
    header: {},
    month_selector_label: {},
    year_selector_label: {},
    weekdays: {},
    weekday: {},
    day: {},
    day_label: {},
    today_label: {},
    month: {},
    month_label: {},
    year: {},
    year_label: {},
    button_prev_image: {},
    button_next_image: {},
  });

  return { __esModule: true, default: MockDateTimePicker, useDefaultStyles };
});
jest.mock('@/src/context/AuthContext', () => ({
  useAuth: () => ({ logout: jest.fn(), isBusiness: true, isLoading: false }),
}));

describe('dashboard flow', () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show empty prompt when no date selected', async () => {
    render(<AdminCalendarScreen />);

    await waitFor(() => {
      expect(screen.getByText('Selecciona un día')).toBeTruthy();
    });
  });

  it('should render FAB button', async () => {
    render(<AdminCalendarScreen />);

    await waitFor(() => {
      expect(screen.getByLabelText('Crear evento')).toBeTruthy();
    });
  });

  it('should render calendar picker', async () => {
    render(<AdminCalendarScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('datetime-picker')).toBeTruthy();
    });
  });
});
