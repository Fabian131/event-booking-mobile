import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CreateEventScreen from '@/app/(admin)/create-event';
import { eventService } from '@/src/services/eventService';
import { ApiError } from '@/src/types/auth';

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

describe('server error submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display translated schedule conflict error', async () => {
    (eventService.createEvent as jest.Mock).mockRejectedValueOnce(
      new ApiError('Error', 409, [{ field: 'schedule', message: 'An event already occupies this date and time slot' }])
    );

    render(<CreateEventScreen />);

    // Since we mocked validation to return empty, we can just press submit
    fireEvent.press(screen.getByText('Crear Evento'));

    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Ya existe un evento programado en esta fecha y horario. Por favor selecciona otro.')).toBeTruthy();
    });
  });
});
