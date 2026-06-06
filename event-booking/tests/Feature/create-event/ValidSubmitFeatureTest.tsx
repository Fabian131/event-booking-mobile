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

jest.mock('@/src/utils/validators', () => {
  const original = jest.requireActual('@/src/utils/validators');
  return {
    ...original,
    validateCreateEventForm: jest.fn(() => []),
  };
});

describe('valid form submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call eventService.createEvent, show success banner, and navigate back on success', async () => {
    (eventService.createEvent as jest.Mock).mockResolvedValueOnce({});

    render(<CreateEventScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Crear Evento' }));

    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Evento creado exitosamente.')).toBeTruthy();
    });

    await waitFor(() => {
      expect(router.back).toHaveBeenCalled();
    }, { timeout: 2000, interval: 100 });
  });
});
