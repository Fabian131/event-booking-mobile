import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CreateEventScreen from '@/app/(admin)/create-event';
import { eventService } from '@/src/services/eventService';
import { router } from 'expo-router';

jest.mock('@/src/services/eventService');
jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

jest.mock('@/src/utils/validators', () => {
  const original = jest.requireActual('@/src/utils/validators');
  return {
    ...original,
    validateCreateEventForm: jest.fn(() => []),
  };
});

describe('create event flow', () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full creation flow: modals, submit, success, and redirect', async () => {
    (eventService.createEvent as jest.Mock).mockResolvedValueOnce({});

    render(<CreateEventScreen />);

    // 1. Select category via modal
    fireEvent.press(screen.getByText('Selecciona una categoría'));
    await waitFor(() => {
      expect(screen.getByText('Música')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('Música'));
    await waitFor(() => {
      expect(screen.queryByText('Selecciona una categoría')).toBeNull();
    });

    // 2. Select date via modal
    fireEvent.press(screen.getByText('Selecciona una fecha'));
    await waitFor(() => expect(screen.getByText('Fecha del evento')).toBeTruthy());
    fireEvent.press(screen.getByText('Listo'));
    await waitFor(() => {
      expect(screen.queryByText('Selecciona una fecha')).toBeNull();
    });

    // 3. Select start time via modal
    fireEvent.press(screen.getByText('Selecciona hora de inicio'));
    await waitFor(() => expect(screen.getByText('Hora de inicio')).toBeTruthy());
    fireEvent.press(screen.getByText('Listo'));
    await waitFor(() => {
      expect(screen.queryByText('Selecciona hora de inicio')).toBeNull();
    });

    // 4. Select end time via modal
    fireEvent.press(screen.getByText('Selecciona hora de fin'));
    await waitFor(() => expect(screen.getByText('Hora de fin')).toBeTruthy());
    fireEvent.press(screen.getByText('Listo'));
    await waitFor(() => {
      expect(screen.queryByText('Selecciona hora de fin')).toBeNull();
    });

    // 5. Submit form
    fireEvent.press(screen.getByRole('button', { name: 'Crear Evento' }));

    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Evento creado exitosamente.')).toBeTruthy();
    });

    // Redirect after 1200ms setTimeout — allow real delay
    await waitFor(() => {
      expect(router.back).toHaveBeenCalled();
    }, { timeout: 2000, interval: 100 });
  });
});
