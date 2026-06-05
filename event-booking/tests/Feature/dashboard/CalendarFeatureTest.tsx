import { render, screen } from '@testing-library/react-native';
import { Calendar } from '@/src/components/domain/Calendar';

jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

describe('Calendar component', () => {
  const noop = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render month header with navigation arrows', () => {
    render(
      <Calendar
        calendarDates={[]}
        selectedDate={null}
        currentYear={2026}
        currentMonth={6}
        onDatePress={noop}
        onPreviousMonth={noop}
        onNextMonth={noop}
      />,
    );

    expect(screen.getByText('Junio 2026')).toBeTruthy();
    expect(screen.getByText('<')).toBeTruthy();
    expect(screen.getByText('>')).toBeTruthy();
  });

  it('should render day name headers', () => {
    render(
      <Calendar
        calendarDates={[]}
        selectedDate={null}
        currentYear={2026}
        currentMonth={1}
        onDatePress={noop}
        onPreviousMonth={noop}
        onNextMonth={noop}
      />,
    );

    for (const name of ['L', 'M', 'X', 'J', 'V', 'S', 'D']) {
      expect(screen.getAllByText(name).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should render 42 day cells', () => {
    render(
      <Calendar
        calendarDates={[]}
        selectedDate={null}
        currentYear={2026}
        currentMonth={6}
        onDatePress={noop}
        onPreviousMonth={noop}
        onNextMonth={noop}
      />,
    );

    const dayButtons = screen.getAllByRole('button');
    const dayCells = dayButtons.filter((b) => /^\d/.test(b.props.accessibilityLabel || ''));
    expect(dayCells.length).toBe(42);
  });

  it('should display skeleton grid when loading', () => {
    render(
      <Calendar
        calendarDates={[]}
        selectedDate={null}
        currentYear={2026}
        currentMonth={6}
        onDatePress={noop}
        onPreviousMonth={noop}
        onNextMonth={noop}
        loading
      />,
    );

    expect(screen.getByText('Junio 2026')).toBeTruthy();
  });
});
