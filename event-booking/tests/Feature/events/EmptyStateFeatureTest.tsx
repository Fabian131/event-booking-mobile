import { act, render, screen, waitFor } from '@testing-library/react-native';
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

describe('empty state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display empty state when API returns no events', async () => {
    (eventsService.list as jest.Mock).mockResolvedValueOnce({
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
        has_next_page: false,
      },
    });

    await renderFeedScreen();

    await waitFor(() => {
      expect(screen.getByText('Sin eventos por ahora')).toBeTruthy();
      expect(screen.getByText('Vuelve pronto para descubrir nuevas actividades.')).toBeTruthy();
    });
  });

  it('should not display event cards when list is empty', async () => {
    (eventsService.list as jest.Mock).mockResolvedValueOnce({
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
        has_next_page: false,
      },
    });

    await renderFeedScreen();

    await waitFor(() => {
      expect(screen.queryByText('Summer Festival')).toBeNull();
    });
  });
});
