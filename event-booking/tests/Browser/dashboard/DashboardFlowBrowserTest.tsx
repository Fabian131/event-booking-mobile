import { render, screen, waitFor } from '@testing-library/react-native';
import { eventService } from '@/src/services/event';
import AdminCalendarScreen from '@/app/(tabs)/index';

jest.mock('@/src/services/event');
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

describe('dashboard flow', () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show empty prompt when no date selected', async () => {
    (eventService.getCalendarDates as jest.Mock).mockResolvedValueOnce({
      data: [],
      year: 2026,
      month: 6,
    });

    render(<AdminCalendarScreen />);

    await waitFor(() => {
      expect(screen.getByText('Selecciona un día')).toBeTruthy();
    });
  });

  it('should render FAB button', async () => {
    (eventService.getCalendarDates as jest.Mock).mockResolvedValueOnce({
      data: [],
      year: 2026,
      month: 6,
    });

    render(<AdminCalendarScreen />);

    await waitFor(() => {
      expect(screen.getByLabelText('Crear nuevo evento')).toBeTruthy();
    });
  });

  it('should render calendar header with current month', async () => {
    (eventService.getCalendarDates as jest.Mock).mockResolvedValueOnce({
      data: [],
      year: 2026,
      month: 6,
    });

    render(<AdminCalendarScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Junio 2026/)).toBeTruthy();
    });
  });
});
