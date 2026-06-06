import { render, screen } from '@testing-library/react-native';
import { Calendar } from '@/src/components/domain/Calendar';

jest.mock('react-native-ui-datepicker', () => {
  const React = require('react');
  const { View, Text, Pressable } = require('react-native');

  const MockDateTimePicker = ({ date, onChange, onMonthChange, onYearChange }: {
    date?: string;
    onChange?: (params: { date: string }) => void;
    onMonthChange?: (month: number) => void;
    onYearChange?: (year: number) => void;
  }) => {
    return React.createElement(View, { testID: 'datetime-picker' },
      React.createElement(Text, null, 'DateTimePicker'),
      React.createElement(Pressable, {
        testID: 'mock-day-press',
        onPress: () => onChange?.({ date: '2026-06-15T00:00:00.000Z' }),
      }, React.createElement(Text, null, 'Press Day')),
      React.createElement(Pressable, {
        testID: 'mock-month-change',
        onPress: () => onMonthChange?.(6),
      }, React.createElement(Text, null, 'Change Month')),
      React.createElement(Pressable, {
        testID: 'mock-year-change',
        onPress: () => onYearChange?.(2027),
      }, React.createElement(Text, null, 'Change Year')),
    );
  };

  const useDefaultStyles = () => ({
    today: {},
    selected: {},
    selected_label: {},
    header: {},
  });

  return {
    __esModule: true,
    default: MockDateTimePicker,
    useDefaultStyles,
  };
});

jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

describe('Calendar component', () => {
  const noop = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the DateTimePicker', () => {
    render(
      <Calendar
        calendarDates={[]}
        selectedDate={null}
        currentYear={2026}
        currentMonth={6}
        onDatePress={noop}
        onMonthChange={noop}
        onYearChange={noop}
        calendarLoading={false}
      />,
    );

    expect(screen.getByText('DateTimePicker')).toBeTruthy();
  });

  it('should call onDatePress when a day is pressed', () => {
    render(
      <Calendar
        calendarDates={[]}
        selectedDate={null}
        currentYear={2026}
        currentMonth={6}
        onDatePress={noop}
        onMonthChange={noop}
        onYearChange={noop}
        calendarLoading={false}
      />,
    );

    const dayPress = screen.getByTestId('mock-day-press');
    const { fireEvent } = require('@testing-library/react-native');
    fireEvent.press(dayPress);

    expect(noop).toHaveBeenCalledWith('2026-06-15');
  });

  it('should call onMonthChange when month changes', () => {
    render(
      <Calendar
        calendarDates={[]}
        selectedDate={null}
        currentYear={2026}
        currentMonth={6}
        onDatePress={noop}
        onMonthChange={noop}
        onYearChange={noop}
        calendarLoading={false}
      />,
    );

    const monthChange = screen.getByTestId('mock-month-change');
    const { fireEvent } = require('@testing-library/react-native');
    fireEvent.press(monthChange);

    expect(noop).toHaveBeenCalledWith(7);
  });

  it('should call onYearChange when year changes', () => {
    render(
      <Calendar
        calendarDates={[]}
        selectedDate={null}
        currentYear={2026}
        currentMonth={6}
        onDatePress={noop}
        onMonthChange={noop}
        onYearChange={noop}
        calendarLoading={false}
      />,
    );

    const yearChange = screen.getByTestId('mock-year-change');
    const { fireEvent } = require('@testing-library/react-native');
    fireEvent.press(yearChange);

    expect(noop).toHaveBeenCalledWith(2027);
  });

  it('should show loading overlay when calendarLoading is true', () => {
    render(
      <Calendar
        calendarDates={[]}
        selectedDate={null}
        currentYear={2026}
        currentMonth={6}
        onDatePress={noop}
        onMonthChange={noop}
        onYearChange={noop}
        calendarLoading
      />,
    );

    expect(screen.getByText('Cargando...')).toBeTruthy();
  });
});
