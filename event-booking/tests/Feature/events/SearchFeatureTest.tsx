import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { eventsService } from '@/src/services/events';
import { EVENTS, CATEGORY } from '@/src/constants/ui';
import { ApiError } from '@/src/types/auth';
import EventSearchScreen from '@/app/(customer)/events/search';

const mockPush = jest.fn();

jest.mock('@/src/services/events');
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/src/context/AuthContext', () => ({
  useAuth: jest.fn(() => ({ logout: jest.fn() })),
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

function makeEvent(overrides = {}) {
  return {
    id: '1',
    title: 'Summer Festival',
    description: null,
    image_url: null,
    max_capacity: 100,
    remaining_capacity: 50,
    category: 'music',
    date: '2026-07-15',
    start_time: '10:00:00',
    end_time: '18:00:00',
    is_active: true,
    created_at: '2026-06-01T00:00:00+00:00',
    updated_at: '2026-06-01T00:00:00+00:00',
    ...overrides,
  };
}

function makePagination(overrides = {}) {
  return { page: 1, limit: 20, total: 1, total_pages: 1, has_next_page: false, ...overrides };
}

async function renderSearch() {
  const view = render(<EventSearchScreen />);
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

describe('search screen — render', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  it('should render text input, category chips and date button on mount', async () => {
    (eventsService.list as jest.Mock).mockResolvedValueOnce({
      data: [],
      pagination: makePagination({ total: 0 }),
    });
    await renderSearch();
    await waitFor(() => {
      expect(screen.getByText(EVENTS.SEARCH_INPUT_LABEL)).toBeTruthy();
      expect(screen.getByText(EVENTS.SEARCH_ALL_CATEGORIES)).toBeTruthy();
      expect(screen.getByText(EVENTS.SEARCH_ANY_DATE)).toBeTruthy();
      expect(screen.getByText(EVENTS.SEARCH_RESULTS_LABEL)).toBeTruthy();
    });
  });

  it('should display event cards returned by the API on initial load', async () => {
    (eventsService.list as jest.Mock).mockResolvedValueOnce({
      data: [makeEvent({ title: 'Summer Festival' })],
      pagination: makePagination(),
    });
    await renderSearch();
    await waitFor(() => {
      expect(screen.getByText('Summer Festival')).toBeTruthy();
    });
  });
});

describe('search screen — category filter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call API with category param when a chip is selected', async () => {
    (eventsService.list as jest.Mock).mockResolvedValue({
      data: [],
      pagination: makePagination({ total: 0 }),
    });
    await renderSearch();
    await waitFor(() => expect(eventsService.list).toHaveBeenCalledTimes(1));

    fireEvent.press(screen.getByText(CATEGORY.LABELS['music']));

    await waitFor(() => {
      expect(eventsService.list).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'music' }),
      );
    });
  });

  it('should remove category filter when "Todas" chip is pressed after selecting one', async () => {
    (eventsService.list as jest.Mock).mockResolvedValue({
      data: [],
      pagination: makePagination({ total: 0 }),
    });
    await renderSearch();
    fireEvent.press(screen.getByText(CATEGORY.LABELS['music']));
    await waitFor(() =>
      expect(eventsService.list).toHaveBeenLastCalledWith(
        expect.objectContaining({ category: 'music' }),
      ),
    );

    fireEvent.press(screen.getByText(EVENTS.SEARCH_ALL_CATEGORIES));

    await waitFor(() => {
      const lastCall = (eventsService.list as jest.Mock).mock.calls.at(-1)[0];
      expect(lastCall.category).toBeUndefined();
    });
  });
});

describe('search screen — empty states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show feed empty state when no filters are active and API returns empty', async () => {
    (eventsService.list as jest.Mock).mockResolvedValueOnce({
      data: [],
      pagination: makePagination({ total: 0 }),
    });
    await renderSearch();
    await waitFor(() => {
      expect(screen.getByText(EVENTS.FEED_EMPTY_TITLE)).toBeTruthy();
      expect(screen.getByText(EVENTS.FEED_EMPTY_SUBTITLE)).toBeTruthy();
    });
  });

  it('should show search empty state when filters are active and API returns empty', async () => {
    (eventsService.list as jest.Mock).mockResolvedValue({
      data: [],
      pagination: makePagination({ total: 0 }),
    });
    await renderSearch();
    fireEvent.press(screen.getByText(CATEGORY.LABELS['music']));
    await waitFor(() => {
      expect(screen.getByText(EVENTS.SEARCH_EMPTY_TITLE)).toBeTruthy();
      expect(screen.getByText(EVENTS.SEARCH_EMPTY_SUBTITLE)).toBeTruthy();
    });
  });
});

describe('search screen — error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display error banner when API throws a network error', async () => {
    (eventsService.list as jest.Mock).mockRejectedValueOnce(
      new TypeError('Network request failed'),
    );
    await renderSearch();
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los eventos')).toBeTruthy();
      expect(screen.getByText(EVENTS.FEED_ERROR_RETRY)).toBeTruthy();
    });
  });

  it('should display error banner when API returns a 500 server error', async () => {
    (eventsService.list as jest.Mock).mockRejectedValueOnce(
      new ApiError('Error interno del servidor', 500),
    );
    await renderSearch();
    await waitFor(() => {
      expect(screen.getByText('Error interno del servidor')).toBeTruthy();
      expect(screen.getByText(EVENTS.FEED_ERROR_RETRY)).toBeTruthy();
    });
  });

  it('should retry the API call and recover when Reintentar is pressed', async () => {
    (eventsService.list as jest.Mock)
      .mockRejectedValueOnce(new TypeError('Network request failed'))
      .mockResolvedValueOnce({
        data: [makeEvent({ title: 'Recovered Event' })],
        pagination: makePagination(),
      });
    await renderSearch();
    await waitFor(() => expect(screen.getByText(EVENTS.FEED_ERROR_RETRY)).toBeTruthy());
    fireEvent.press(screen.getByText(EVENTS.FEED_ERROR_RETRY));
    await waitFor(() => expect(screen.getByText('Recovered Event')).toBeTruthy());
    expect(eventsService.list).toHaveBeenCalledTimes(2);
  });
});

describe('search screen — navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  it('should navigate to event detail screen when a result card is pressed', async () => {
    (eventsService.list as jest.Mock).mockResolvedValueOnce({
      data: [makeEvent({ id: 'abc-123', title: 'Summer Festival' })],
      pagination: makePagination(),
    });
    await renderSearch();
    await waitFor(() => expect(screen.getByText('Summer Festival')).toBeTruthy());
    fireEvent.press(screen.getByText('Summer Festival'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(customer)/events/[id]',
      params: { id: 'abc-123' },
    });
  });
});
