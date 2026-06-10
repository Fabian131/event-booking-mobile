import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CreateEventScreen from '@/app/(admin)/create-event';
import { eventsService } from '@/src/services/events';
import { ApiError } from '@/src/types/auth';

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

describe('server 422 validation error submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render server-side field validation errors from details[]', async () => {
    (eventsService.create as jest.Mock).mockRejectedValueOnce(
      new ApiError('Validation error', 422, [
        { field: 'title', message: 'Title must be at least 3 characters' },
        { field: 'max_capacity', message: 'Capacity must be a positive integer' },
      ])
    );

    render(<CreateEventScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Crear Evento' }));

    await waitFor(() => {
      expect(eventsService.create).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Title must be at least 3 characters')).toBeTruthy();
      expect(screen.getByText('Capacity must be a positive integer')).toBeTruthy();
      expect(screen.queryByText('Validation error')).toBeNull();
    });
  });
});
