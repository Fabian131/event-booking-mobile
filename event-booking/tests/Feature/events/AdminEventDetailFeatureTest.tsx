import { Alert, NativeModules } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useEventDetail } from '@/src/hooks/useEventDetail';
import { eventsService } from '@/src/services/events';
import { ApiError } from '@/src/types/auth';
import AdminEventDetailScreen from '@/app/(admin)/events/[id]';
import type { Event } from '@/src/types/events';

jest.mock('@/src/hooks/useEventDetail');
jest.mock('@/src/services/events');
jest.mock('expo-image', () => ({
  Image: 'Image',
}));
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ id: '1' })),
  useRouter: jest.fn(() => ({ push: mockPush, replace: mockReplace })),
  Stack: { Screen: () => null },
}));

function makeEvent(overrides?: Partial<Event>): Event {
  return {
    id: '1',
    title: 'Summer Festival',
    description: 'Annual summer celebration',
    image_url: null,
    max_capacity: 100,
    remaining_capacity: 50,
    category: 'music',
    date: '2026-07-15',
    start_time: '10:00:00',
    end_time: '18:00:00',
    is_active: true,
    created_at: '2026-06-01T00:00:00+00:00',
    updated_at: '2026-06-01T00:00:00+00:00',
    ...overrides,
  };
}

async function renderDetailScreen() {
  const view = render(<AdminEventDetailScreen />);
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

describe('admin event detail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state before data resolves', () => {
    (useEventDetail as jest.Mock).mockReturnValue({ event: null, loading: true, error: null });
    render(<AdminEventDetailScreen />);
    expect(screen.getByText('Cargando evento...')).toBeTruthy();
  });

  it('should render title, category badge, all InfoRow labels, and footer buttons', async () => {
    (useEventDetail as jest.Mock).mockReturnValue({ event: makeEvent(), loading: false, error: null });
    await renderDetailScreen();
    expect(screen.getByText('Summer Festival')).toBeTruthy();
    expect(screen.getByText('Música')).toBeTruthy();
    expect(screen.getByText('Fecha')).toBeTruthy();
    expect(screen.getByText('Hora de inicio')).toBeTruthy();
    expect(screen.getByText('Hora de fin')).toBeTruthy();
    expect(screen.getByText('Capacidad máxima')).toBeTruthy();
    expect(screen.getByText('Cupos disponibles')).toBeTruthy();
    expect(screen.getByText('Editar')).toBeTruthy();
    expect(screen.getByText('Ver Reservaciones')).toBeTruthy();
  });

  it('should show error state when API fails', async () => {
    (useEventDetail as jest.Mock).mockReturnValue({ event: null, loading: false, error: 'Error al cargar el evento' });
    await renderDetailScreen();
    expect(screen.getByText('Error al cargar el evento')).toBeTruthy();
  });

  it('should show not-found state when event is null', async () => {
    (useEventDetail as jest.Mock).mockReturnValue({ event: null, loading: false, error: null });
    await renderDetailScreen();
    expect(screen.getByText('Evento no encontrado')).toBeTruthy();
  });

  it('should navigate to edit screen when Editar is pressed', async () => {
    (useEventDetail as jest.Mock).mockReturnValue({ event: makeEvent(), loading: false, error: null });
    await renderDetailScreen();
    fireEvent.press(screen.getByText('Editar'));
    expect(mockPush).toHaveBeenCalledWith('/(admin)/edit-event/1');
  });

  it('should navigate to reservations when Ver Reservaciones is pressed', async () => {
    (useEventDetail as jest.Mock).mockReturnValue({ event: makeEvent(), loading: false, error: null });
    await renderDetailScreen();
    fireEvent.press(screen.getByText('Ver Reservaciones'));
    expect(mockPush).toHaveBeenCalledWith('/(admin)/reservations/1');
  });

  // ── Delete event flow ────────────────────────────────────────────

  it('renders the options button with correct accessibility label', async () => {
    (useEventDetail as jest.Mock).mockReturnValue({ event: makeEvent(), loading: false, error: null });
    await renderDetailScreen();
    expect(screen.getByLabelText('Opciones')).toBeTruthy();
  });

  it('shows options Alert when options button is pressed', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    (useEventDetail as jest.Mock).mockReturnValue({ event: makeEvent(), loading: false, error: null });
    await renderDetailScreen();

    fireEvent.press(screen.getByLabelText('Opciones'));

    expect(alertSpy).toHaveBeenCalledTimes(1);
    const callArgs = alertSpy.mock.calls[0];
    expect(callArgs[0]).toBe('Opciones');
  });

  it('shows confirmation Alert when Eliminar evento is selected from options', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const deleteOption = buttons?.find((b: { text: string }) => b.text === 'Eliminar evento');
      if (deleteOption) {
        deleteOption.onPress?.();
      }
    });

    (useEventDetail as jest.Mock).mockReturnValue({ event: makeEvent(), loading: false, error: null });
    await renderDetailScreen();

    fireEvent.press(screen.getByLabelText('Opciones'));

    expect(Alert.alert).toHaveBeenCalledWith(
      '¿Eliminar evento?',
      expect.stringContaining('Esta acción es permanente'),
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancelar' }),
        expect.objectContaining({ text: 'Eliminar' }),
      ]),
      expect.any(Object),
    );
  });

  it('calls eventsService.delete and redirects on confirmed delete', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const deleteOption = buttons?.find((b: { text: string }) =>
        b.text === 'Eliminar evento' || b.text === 'Eliminar',
      );
      if (deleteOption) {
        deleteOption.onPress?.();
      }
    });

    (eventsService.delete as jest.Mock).mockResolvedValueOnce(undefined);
    (useEventDetail as jest.Mock).mockReturnValue({ event: makeEvent(), loading: false, error: null });
    await renderDetailScreen();

    fireEvent.press(screen.getByLabelText('Opciones'));

    await waitFor(() => {
      expect(eventsService.delete).toHaveBeenCalledWith('1');
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(admin)');
    });
  });

  it('shows network error alert when delete fails with TypeError', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const deleteOption = buttons?.find((b: { text: string }) =>
        b.text === 'Eliminar evento' || b.text === 'Eliminar',
      );
      if (deleteOption) {
        deleteOption.onPress?.();
      }
    });

    (eventsService.delete as jest.Mock).mockRejectedValueOnce(new TypeError('Network request failed'));
    (useEventDetail as jest.Mock).mockReturnValue({ event: makeEvent(), loading: false, error: null });
    await renderDetailScreen();

    fireEvent.press(screen.getByLabelText('Opciones'));

    await waitFor(() => {
      expect(eventsService.delete).toHaveBeenCalled();
    });

    await waitFor(() => {
      const spy = Alert.alert as jest.Mock;
      const errorAlert = spy.mock.calls.find(
        (call: unknown[]) =>
          typeof call[1] === 'string' &&
          call[1].includes('No se pudo conectar'),
      );
      expect(errorAlert).toBeTruthy();
    });
  });

  it('shows API error alert when delete fails with ApiError', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const deleteOption = buttons?.find((b: { text: string }) =>
        b.text === 'Eliminar evento' || b.text === 'Eliminar',
      );
      if (deleteOption) {
        deleteOption.onPress?.();
      }
    });

    (eventsService.delete as jest.Mock).mockRejectedValueOnce(
      new ApiError('Event not found', 404),
    );
    (useEventDetail as jest.Mock).mockReturnValue({ event: makeEvent(), loading: false, error: null });
    await renderDetailScreen();

    fireEvent.press(screen.getByLabelText('Opciones'));

    await waitFor(() => {
      expect(eventsService.delete).toHaveBeenCalled();
    });

    await waitFor(() => {
      const spy = Alert.alert as jest.Mock;
      const errorAlert = spy.mock.calls.find(
        (call: unknown[]) =>
          typeof call[1] === 'string' &&
          call[1] === 'Evento no encontrado',
      );
      expect(errorAlert).toBeTruthy();
    });
  });

  it('shows generic error alert when delete fails with unknown error', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const deleteOption = buttons?.find((b: { text: string }) =>
        b.text === 'Eliminar evento' || b.text === 'Eliminar',
      );
      if (deleteOption) {
        deleteOption.onPress?.();
      }
    });

    (eventsService.delete as jest.Mock).mockRejectedValueOnce(new Error('Something else'));
    (useEventDetail as jest.Mock).mockReturnValue({ event: makeEvent(), loading: false, error: null });
    await renderDetailScreen();

    fireEvent.press(screen.getByLabelText('Opciones'));

    await waitFor(() => {
      expect(eventsService.delete).toHaveBeenCalled();
    });

    await waitFor(() => {
      const spy = Alert.alert as jest.Mock;
      const errorAlert = spy.mock.calls.find(
        (call: unknown[]) =>
          typeof call[1] === 'string' &&
          call[1].includes('Error al eliminar'),
      );
      expect(errorAlert).toBeTruthy();
    });
  });

  it('does not navigate away when delete fails', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const deleteOption = buttons?.find((b: { text: string }) =>
        b.text === 'Eliminar evento' || b.text === 'Eliminar',
      );
      if (deleteOption) {
        deleteOption.onPress?.();
      }
    });

    (eventsService.delete as jest.Mock).mockRejectedValueOnce(new TypeError('Network error'));
    (useEventDetail as jest.Mock).mockReturnValue({ event: makeEvent(), loading: false, error: null });
    await renderDetailScreen();

    fireEvent.press(screen.getByLabelText('Opciones'));

    await waitFor(() => {
      expect(eventsService.delete).toHaveBeenCalled();
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
