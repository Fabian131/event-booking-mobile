import { act, render, screen, waitFor } from '@testing-library/react-native';
import { eventsService } from '@/src/services/events';
import { ApiError } from '@/src/types/auth';
import CustomerEventsScreen from '@/app/(customer)/events/index';

jest.mock('@/src/services/events');
jest.mock('expo-image', () => ({
  Image: 'Image',
}));
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

async function renderFeedScreen() {
  const view = render(<CustomerEventsScreen />);
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

describe('server error', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display error banner on 500 internal server error', async () => {
    (eventsService.list as jest.Mock).mockRejectedValueOnce(
      new ApiError('Error interno del servidor', 500),
    );

    await renderFeedScreen();

    await waitFor(() => {
      expect(screen.getByText('Error interno del servidor')).toBeTruthy();
      expect(screen.getByText('Reintentar')).toBeTruthy();
    });
  });

  it('should display error banner on 503 service unavailable', async () => {
    (eventsService.list as jest.Mock).mockRejectedValueOnce(
      new ApiError('Servicio no disponible', 503),
    );

    await renderFeedScreen();

    await waitFor(() => {
      expect(screen.getByText('Servicio no disponible')).toBeTruthy();
    });
  });

  it('should not display events when server error occurs', async () => {
    (eventsService.list as jest.Mock).mockRejectedValueOnce(
      new ApiError('Error interno del servidor', 500),
    );

    await renderFeedScreen();

    await waitFor(() => {
      expect(screen.getByText('Reintentar')).toBeTruthy();
    });

    expect(screen.queryByText('Summer Festival')).toBeNull();
  });
});
