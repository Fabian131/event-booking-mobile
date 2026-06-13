import { Alert } from 'react-native';
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
  useLocalSearchParams: jest.fn(() => ({ id: 'event-delete-1' })),
  useRouter: jest.fn(() => ({ push: mockPush, replace: mockReplace })),
  Stack: { Screen: () => null },
}));

function makeEvent(overrides?: Partial<Event>): Event {
  return {
    id: 'event-delete-1',
    title: 'Evento a Eliminar',
    description: 'Evento que será eliminado en el test',
    image_url: null,
    max_capacity: 200,
    remaining_capacity: 150,
    category: 'gastronomy',
    date: '2026-09-20',
    start_time: '09:00:00',
    end_time: '14:00:00',
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

function autoConfirmDeleteAlerts() {
  jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
    const eliminarBtn = buttons?.find((b: { text: string }) =>
      b.text === 'Eliminar evento' || b.text === 'Eliminar',
    );
    if (eliminarBtn) {
      eliminarBtn.onPress?.();
      return;
    }
    const okBtn = buttons?.find((b: { text: string }) => b.text === 'OK');
    if (okBtn) {
      okBtn.onPress?.();
    }
  });
}

describe('delete event flow', () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('completes full delete flow: options → confirm → delete → redirect', async () => {
    autoConfirmDeleteAlerts();
    (eventsService.delete as jest.Mock).mockResolvedValueOnce(undefined);
    (useEventDetail as jest.Mock).mockReturnValue({
      event: makeEvent(),
      loading: false,
      error: null,
    });

    await renderDetailScreen();

    expect(screen.getByText('Evento a Eliminar')).toBeTruthy();
    expect(screen.getByLabelText('Opciones')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Opciones'));

    await waitFor(() => {
      expect(eventsService.delete).toHaveBeenCalledWith('event-delete-1');
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(admin)');
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('stays on detail screen when server returns 404 during delete', async () => {
    autoConfirmDeleteAlerts();
    (eventsService.delete as jest.Mock).mockRejectedValueOnce(
      new ApiError('Event not found', 404),
    );
    (useEventDetail as jest.Mock).mockReturnValue({
      event: makeEvent(),
      loading: false,
      error: null,
    });

    await renderDetailScreen();

    fireEvent.press(screen.getByLabelText('Opciones'));

    await waitFor(() => {
      expect(eventsService.delete).toHaveBeenCalled();
    });

    expect(mockReplace).not.toHaveBeenCalled();

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

  it('stays on detail screen when delete fails with network error', async () => {
    autoConfirmDeleteAlerts();
    (eventsService.delete as jest.Mock).mockRejectedValueOnce(
      new TypeError('Failed to fetch'),
    );
    (useEventDetail as jest.Mock).mockReturnValue({
      event: makeEvent(),
      loading: false,
      error: null,
    });

    await renderDetailScreen();

    fireEvent.press(screen.getByLabelText('Opciones'));

    await waitFor(() => {
      expect(eventsService.delete).toHaveBeenCalled();
    });

    expect(mockReplace).not.toHaveBeenCalled();

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

  it('does nothing when options Cancel is pressed', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const cancelBtn = buttons?.find((b: { text: string }) => b.text === 'Cancelar');
      if (cancelBtn) {
        cancelBtn.onPress?.();
      }
    });

    (useEventDetail as jest.Mock).mockReturnValue({
      event: makeEvent(),
      loading: false,
      error: null,
    });

    await renderDetailScreen();

    fireEvent.press(screen.getByLabelText('Opciones'));

    expect(eventsService.delete).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does nothing when confirmation Cancel is pressed after selecting delete', async () => {
    let deleteOptionPressed = false;

    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const eliminarBtn = buttons?.find((b: { text: string }) =>
        b.text === 'Eliminar evento',
      );
      if (eliminarBtn) {
        deleteOptionPressed = true;
        eliminarBtn.onPress?.();
        return;
      }

      const cancelBtn = buttons?.find((b: { text: string }) => b.text === 'Cancelar');
      if (cancelBtn && deleteOptionPressed) {
        cancelBtn.onPress?.();
        return;
      }
    });

    (useEventDetail as jest.Mock).mockReturnValue({
      event: makeEvent(),
      loading: false,
      error: null,
    });

    await renderDetailScreen();

    fireEvent.press(screen.getByLabelText('Opciones'));

    expect(eventsService.delete).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('disables options button and footer buttons while deleting', async () => {
    let resolveDelete: (value: unknown) => void;
    const deletePromise = new Promise((resolve) => {
      resolveDelete = resolve;
    });

    autoConfirmDeleteAlerts();
    (eventsService.delete as jest.Mock).mockReturnValueOnce(deletePromise);
    (useEventDetail as jest.Mock).mockReturnValue({
      event: makeEvent(),
      loading: false,
      error: null,
    });

    await renderDetailScreen();

    fireEvent.press(screen.getByLabelText('Opciones'));

    const optionsButton = screen.getByLabelText('Opciones');
    expect(optionsButton.props.accessibilityState.disabled).toBe(true);

    const editButton = screen.getByRole('button', { name: 'Editar' });
    expect(editButton.props.accessibilityState.disabled).toBe(true);

    const reservationsButton = screen.getByRole('button', { name: 'Ver Reservaciones' });
    expect(reservationsButton.props.accessibilityState.disabled).toBe(true);

    resolveDelete!(undefined);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(admin)');
    });
  });
});
