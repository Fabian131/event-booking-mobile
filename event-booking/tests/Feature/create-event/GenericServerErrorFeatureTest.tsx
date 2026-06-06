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

describe('generic server error submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display generic error banner when unexpected error occurs', async () => {
    (eventService.createEvent as jest.Mock).mockRejectedValueOnce(new Error('Something went wrong'));

    render(<CreateEventScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Crear Evento' }));

    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Ocurrió un error inesperado. Intenta nuevamente.')).toBeTruthy();
    });
  });
});
