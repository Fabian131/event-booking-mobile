import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { eventsService } from '@/src/services/events';
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

describe('network error', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display error banner when server is unreachable', async () => {
    (eventsService.list as jest.Mock).mockRejectedValueOnce(
      new TypeError('Network request failed'),
    );

    await renderFeedScreen();

    await waitFor(() => {
      expect(screen.getByText('Error al cargar los eventos')).toBeTruthy();
      expect(screen.getByText('Reintentar')).toBeTruthy();
    });
  });

  it('should retry the request when Reintentar is pressed', async () => {
    (eventsService.list as jest.Mock)
      .mockRejectedValueOnce(new TypeError('Network request failed'))
      .mockResolvedValueOnce({
        data: [
          {
            id: '1',
            title: 'Recovered Event',
            description: null,
            image_url: null,
            max_capacity: 50,
            remaining_capacity: 25,
            category: 'culture',
            date: '2026-07-15',
            start_time: '10:00:00',
            end_time: '18:00:00',
            is_active: true,
            created_at: '2026-06-01T00:00:00+00:00',
            updated_at: '2026-06-01T00:00:00+00:00',
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, total_pages: 1, has_next_page: false },
      });

    await renderFeedScreen();

    await waitFor(() => {
      expect(screen.getByText('Reintentar')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Reintentar'));

    await waitFor(() => {
      expect(screen.getByText('Recovered Event')).toBeTruthy();
    });

    expect(eventsService.list).toHaveBeenCalledTimes(2);
  });
});
