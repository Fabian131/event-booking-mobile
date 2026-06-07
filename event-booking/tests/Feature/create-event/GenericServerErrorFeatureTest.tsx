import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CreateEventScreen from '@/app/(admin)/create-event';
import { eventsService } from '@/src/services/events';

jest.mock('@/src/services/events');
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
    (eventsService.create as jest.Mock).mockRejectedValueOnce(new Error('Something went wrong'));

    render(<CreateEventScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Crear Evento' }));

    await waitFor(() => {
      expect(eventsService.create).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Ocurrió un error inesperado. Intenta nuevamente.')).toBeTruthy();
    });
  });
});
