import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { FlatList } from 'react-native';
import { eventsService } from '@/src/services/events';
import { EVENTS, CATEGORY } from '@/src/constants/ui';
import { ApiError } from '@/src/types/auth';
import AdminSearchScreen from '@/app/(admin)/search';

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
  const view = render(<AdminSearchScreen />);
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

describe('admin search screen — render', () => {
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
      data: [makeEvent({ title: 'Admin Event' })],
      pagination: makePagination(),
    });
    await renderSearch();
    await waitFor(() => {
      expect(screen.getByText('Admin Event')).toBeTruthy();
    });
  });
});

describe('admin search screen — text search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call API with search param after typing text', async () => {
    (eventsService.list as jest.Mock).mockResolvedValue({
      data: [],
      pagination: makePagination({ total: 0 }),
    });
    await renderSearch();
    await waitFor(() => expect(eventsService.list).toHaveBeenCalledTimes(1));

    const input = screen.getByPlaceholderText(EVENTS.SEARCH_INPUT_PLACEHOLDER);
    fireEvent.changeText(input, 'festival');

    await waitFor(() => {
      expect(eventsService.list).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'festival' }),
      );
    }, { timeout: 1500 });
  });
});

describe('admin search screen — date filter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call API with date param when a date is selected', async () => {
    (eventsService.list as jest.Mock).mockResolvedValue({
      data: [],
      pagination: makePagination({ total: 0 }),
    });
    await renderSearch();
    await waitFor(() => expect(eventsService.list).toHaveBeenCalledTimes(1));

    fireEvent.press(screen.getByText(EVENTS.SEARCH_ANY_DATE));
    fireEvent.press(screen.getByText(EVENTS.CREATE_MODAL_DONE));

    await waitFor(() => {
      expect(eventsService.list).toHaveBeenCalledWith(
        expect.objectContaining({ date: expect.any(String) }),
      );
    });
  });
});

describe('admin search screen — category filter', () => {
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
});

describe('admin search screen — loading skeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show skeleton list while initial data loads', async () => {
    let resolvePromise!: (value: unknown) => void;
    (eventsService.list as jest.Mock).mockReturnValue(
      new Promise((resolve) => { resolvePromise = resolve; }),
    );

    render(<AdminSearchScreen />);
    await act(async () => { await Promise.resolve(); });

    const list = screen.getByTestId('admin-event-search-results');
    expect(list).toBeTruthy();

    await act(async () => {
      resolvePromise({ data: [], pagination: makePagination({ total: 0 }) });
    });
  });
});

describe('admin search screen — error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show error banner when API returns a server error', async () => {
    (eventsService.list as jest.Mock).mockRejectedValueOnce(
      new ApiError('Error del servidor', 500),
    );
    await renderSearch();
    await waitFor(() => {
      expect(screen.getByText('Error del servidor')).toBeTruthy();
      expect(screen.getByText(EVENTS.FEED_ERROR_RETRY)).toBeTruthy();
    });
  });

  it('should show network error when fetch fails', async () => {
    (eventsService.list as jest.Mock).mockRejectedValueOnce(
      new TypeError('Failed to fetch'),
    );
    await renderSearch();
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los eventos')).toBeTruthy();
    });
  });
});

describe('admin search screen — pagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load more events when onEndReached fires', async () => {
    (eventsService.list as jest.Mock)
      .mockResolvedValueOnce({
        data: [makeEvent({ id: '1', title: 'Page 1 Event' })],
        pagination: makePagination({ page: 1, has_next_page: true, total: 40, total_pages: 2 }),
      })
      .mockResolvedValueOnce({
        data: [makeEvent({ id: '2', title: 'Page 2 Event' })],
        pagination: makePagination({ page: 2, has_next_page: false, total: 40, total_pages: 2 }),
      });

    await renderSearch();

    await waitFor(() => {
      expect(screen.getByText('Page 1 Event')).toBeTruthy();
    });

    await act(async () => {
      fireEvent(screen.getByTestId('admin-event-search-results'), 'onEndReached');
    });

    await waitFor(() => {
      expect(screen.getByText('Page 2 Event')).toBeTruthy();
    });

    expect(eventsService.list).toHaveBeenCalledTimes(2);
  });
});

describe('admin search screen — empty states', () => {
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

describe('admin search screen — navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  it('should navigate to admin event detail when a result card is pressed', async () => {
    (eventsService.list as jest.Mock).mockResolvedValueOnce({
      data: [makeEvent({ id: 'abc-123', title: 'Admin Event' })],
      pagination: makePagination(),
    });
    await renderSearch();
    await waitFor(() => expect(screen.getByText('Admin Event')).toBeTruthy());
    fireEvent.press(screen.getByText('Admin Event'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(admin)/events/[id]',
      params: { id: 'abc-123' },
    });
  });
});
