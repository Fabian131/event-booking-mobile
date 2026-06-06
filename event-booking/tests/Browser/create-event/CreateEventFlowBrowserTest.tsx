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

// DateTimePicker is only rendered on Android in the new implementation.
// jest-expo runs as iOS by default so the native picker is never reached.
// Keep a lightweight mock just in case.
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

describe('create event flow', () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full creation flow and show loading states', async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (eventService.createEvent as jest.Mock).mockReturnValueOnce(pendingPromise);

    render(<CreateEventScreen />);

    // 1. Fill text fields
    fireEvent.changeText(screen.getByPlaceholderText('Nombre del evento'), 'Gran Concierto');
    fireEvent.changeText(screen.getByPlaceholderText('Breve descripcion del evento'), 'Un evento espectacular');
    fireEvent.changeText(screen.getByPlaceholderText('Ej. 100'), '500');

    // 2. Select category via modal (new pure-JS implementation)
    fireEvent.press(screen.getByText('Selecciona una categoria'));
    await waitFor(() => {
      expect(screen.getByText('Musica')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('Musica'));
    await waitFor(() => {
      expect(screen.queryByText('Selecciona una categoria')).toBeNull();
    });

    // 3. Select date via modal — open, press Listo to confirm default value
    fireEvent.press(screen.getByText('Selecciona una fecha'));
    await waitFor(() => expect(screen.getByText('Fecha del evento')).toBeTruthy());
    fireEvent.press(screen.getByText('Listo'));
    await waitFor(() => {
      expect(screen.queryByText('Selecciona una fecha')).toBeNull();
    });

    // 4. Select start time via modal
    fireEvent.press(screen.getByText('Selecciona hora de inicio'));
    await waitFor(() => expect(screen.getByText('Hora de inicio')).toBeTruthy());
    // Use spinners to set 09:00 (press Hora down once: 12->11->...->9 is complex, just confirm default)
    fireEvent.press(screen.getAllByText('Listo')[0]);
    await waitFor(() => {
      expect(screen.queryByText('Selecciona hora de inicio')).toBeNull();
    });

    // 5. Select end time via modal (needs to be after start time)
    fireEvent.press(screen.getByText('Selecciona hora de fin'));
    await waitFor(() => expect(screen.getByText('Hora de fin')).toBeTruthy());
    // Press Hora up once to ensure end time > start time
    const upButtons = screen.getAllByText('▲');
    fireEvent.press(upButtons[0]);
    fireEvent.press(screen.getAllByText('Listo')[0]);
    await waitFor(() => {
      expect(screen.queryByText('Selecciona hora de fin')).toBeNull();
    });

    // 4. Submit form
    fireEvent.press(screen.getByRole('button', { name: 'Crear Evento' }));

    // Verify API called with everything
    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalled();
    });

    // Check loading state (button disabled)
    const submitBtn = screen.getByText('Crear Evento').parent;
    expect(submitBtn?.props.accessibilityState?.disabled).toBe(true);

    // Resolve API
    resolvePromise!({});

    // Verify redirect
    await waitFor(() => {
      expect(router.back).toHaveBeenCalled();
    });
  });
});
