import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CreateEventScreen from '@/app/(admin)/create-event';
import { eventService } from '@/src/services/eventService';

jest.mock('@/src/services/eventService');
jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('@/src/utils/validators', () => {
  const original = jest.requireActual('@/src/utils/validators');
  return {
    ...original,
    validateCreateEventForm: jest.fn(() => []),
  };
});

describe('network error submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display network error banner when TypeError occurs', async () => {
    (eventService.createEvent as jest.Mock).mockRejectedValueOnce(new TypeError('Network request failed'));

    render(<CreateEventScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Crear Evento' }));

    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('No se pudo conectar con el servidor. Verifica tu conexión a internet.')).toBeTruthy();
    });
  });
});
