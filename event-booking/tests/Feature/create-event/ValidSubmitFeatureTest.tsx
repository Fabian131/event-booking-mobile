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

// Mock validateCreateEventForm to bypass UI filling for this test
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

  it('should call eventService.createEvent and navigate back on success', async () => {
    (eventService.createEvent as jest.Mock).mockResolvedValueOnce({});

    render(<CreateEventScreen />);

    // Since we mocked validation to return empty array, we can just press submit
    fireEvent.press(screen.getByRole('button', { name: 'Crear Evento' }));

    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(router.back).toHaveBeenCalled();
    });
  });
});
