import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { reservationsService } from '@/src/services/reservations';
import ReservationsListScreen from '@/app/(admin)/reservations/[id]';
import { ApiError } from '@/src/types/auth';
import type { Reservation } from '@/src/types/reservations';

jest.mock('@/src/services/reservations');
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ id: 'evt-1' })),
  useRouter: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => (() => void) | void) => {
    const { useEffect } = require('react');
    useEffect(() => {
      const cleanup = cb();
      return cleanup;
    }, []);
  },
}));

jest.spyOn(require('react-native').Alert, 'alert');

function makeReservation(overrides?: Partial<Reservation>): Reservation {
  return {
    id: 'res-1',
    event_id: 'evt-1',
    event_title: 'Summer Festival',
    event_date: '2026-07-15',
    event_start_time: '10:00:00',
    event_end_time: '18:00:00',
    ticket_quantity: 2,
    status: 'CONFIRMED',
    notes: null,
    user: {
      user_id: 'user-1',
      user_name: 'Alice Johnson',
      user_email: 'alice@example.com',
    },
    created_at: '2026-06-01T00:00:00+00:00',
    ...overrides,
  };
}

function makePagination(overrides?: Record<string, unknown>) {
  return {
    page: 1,
    limit: 100,
    total: 1,
    total_pages: 1,
    has_next_page: false,
    ...overrides,
  };
}

async function renderScreen() {
  const view = render(<ReservationsListScreen />);
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

describe('reservations list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render list with customer name, email, and ticket count', async () => {
    (reservationsService.list as jest.Mock).mockResolvedValueOnce({
      data: [
        makeReservation(),
        makeReservation({
          id: 'res-2',
          ticket_quantity: 5,
          user: {
            user_id: 'user-2',
            user_name: 'Bob Smith',
            user_email: 'bob@example.com',
          },
        }),
      ],
      pagination: makePagination({ total: 2 }),
    });

    await renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeTruthy();
      expect(screen.getByText('Bob Smith')).toBeTruthy();
    });

    expect(screen.getByText('alice@example.com')).toBeTruthy();
    expect(screen.getByText('bob@example.com')).toBeTruthy();
    expect(screen.getByText('2 cupos')).toBeTruthy();
    expect(screen.getByText('5 cupos')).toBeTruthy();
  });

  it('should render singular slot label for single ticket', async () => {
    (reservationsService.list as jest.Mock).mockResolvedValueOnce({
      data: [makeReservation({ ticket_quantity: 1 })],
      pagination: makePagination({ total: 1 }),
    });

    await renderScreen();

    await waitFor(() => {
      expect(screen.getByText('1 cupo')).toBeTruthy();
    });
  });

  it('should show empty state when there are no reservations', async () => {
    (reservationsService.list as jest.Mock).mockResolvedValueOnce({
      data: [],
      pagination: makePagination({ total: 0, total_pages: 0 }),
    });

    await renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Sin reservaciones')).toBeTruthy();
      expect(screen.getByText('No hay reservaciones activas para este evento')).toBeTruthy();
    });
  });

  it('should show error banner when API fails with TypeError', async () => {
    (reservationsService.list as jest.Mock).mockRejectedValueOnce(
      new TypeError('Network request failed'),
    );

    await renderScreen();

    await waitFor(() => {
      expect(
        screen.getByText('No se pudo conectar con el servidor. Verifica tu conexión a internet.'),
      ).toBeTruthy();
    });
  });

  it('should show error banner when API fails with ApiError', async () => {
    (reservationsService.list as jest.Mock).mockRejectedValueOnce(
      new ApiError('Not authorized', 403),
    );

    await renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Not authorized')).toBeTruthy();
    });
  });

  it('should call reservationsService.cancel with correct ID on confirm', async () => {
    const { Alert } = require('react-native');
    (reservationsService.list as jest.Mock).mockResolvedValueOnce({
      data: [makeReservation()],
      pagination: makePagination(),
    });
    (reservationsService.cancel as jest.Mock).mockResolvedValueOnce({
      ...makeReservation(),
      status: 'CANCELLED',
    });

    await renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Cancelar'));

    const alertArgs = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = alertArgs[2].find(
      (b: { text: string }) => b.text === 'Sí, cancelar',
    );
    await act(async () => {
      confirmButton.onPress();
    });

    await waitFor(() => {
      expect(reservationsService.cancel).toHaveBeenCalledWith('res-1');
    });
  });

  it('should remove row from list after successful cancellation', async () => {
    const { Alert } = require('react-native');
    (reservationsService.list as jest.Mock).mockResolvedValueOnce({
      data: [makeReservation(), makeReservation({ id: 'res-2' })],
      pagination: makePagination({ total: 2 }),
    });
    (reservationsService.cancel as jest.Mock).mockResolvedValueOnce({
      ...makeReservation(),
      status: 'CANCELLED',
    });

    await renderScreen();

    await waitFor(() => {
      expect(screen.getAllByText('Cancelar').length).toBe(2);
    });

    fireEvent.press(screen.getAllByText('Cancelar')[0]);

    const alertArgs = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = alertArgs[2].find(
      (b: { text: string }) => b.text === 'Sí, cancelar',
    );
    await act(async () => {
      confirmButton.onPress();
    });

    await waitFor(() => {
      expect(screen.getAllByText('Cancelar').length).toBe(1);
    });
  });

  it('should show success banner after cancellation', async () => {
    const { Alert } = require('react-native');
    (reservationsService.list as jest.Mock).mockResolvedValueOnce({
      data: [makeReservation()],
      pagination: makePagination(),
    });
    (reservationsService.cancel as jest.Mock).mockResolvedValueOnce({
      ...makeReservation(),
      status: 'CANCELLED',
    });

    await renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Cancelar'));

    const alertArgs = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = alertArgs[2].find(
      (b: { text: string }) => b.text === 'Sí, cancelar',
    );
    await act(async () => {
      confirmButton.onPress();
    });

    await waitFor(() => {
      expect(screen.getByText('Reservación cancelada exitosamente.')).toBeTruthy();
    });
  });

  it('should show error banner when cancel fails', async () => {
    const { Alert } = require('react-native');
    (reservationsService.list as jest.Mock).mockResolvedValueOnce({
      data: [makeReservation()],
      pagination: makePagination(),
    });
    (reservationsService.cancel as jest.Mock).mockRejectedValueOnce(
      new TypeError('Network error'),
    );

    await renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Cancelar'));

    const alertArgs = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = alertArgs[2].find(
      (b: { text: string }) => b.text === 'Sí, cancelar',
    );
    await act(async () => {
      confirmButton.onPress();
    });

    await waitFor(() => {
      expect(
        screen.getByText('No se pudo conectar con el servidor. Verifica tu conexión a internet.'),
      ).toBeTruthy();
    });
  });
});
