import { act, render, screen, waitFor } from '@testing-library/react-native';
import { eventsService } from '@/src/services/events';
import { CUSTOMER } from '@/src/constants/ui';
import CustomerEventsScreen from '@/app/(customer)/events/index';
import type { Event, PaginationMeta } from '@/src/types/events';

jest.mock('@/src/services/events');
jest.mock('expo-image', () => ({
  Image: 'Image',
}));
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/src/context/AuthContext', () => ({
  useAuth: jest.fn(() => ({ logout: jest.fn() })),
}));

function makeEvent(overrides?: Partial<Event>): Event {
  return {
    id: '1',
    title: 'Summer Festival',
    description: 'Annual summer celebration',
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

function makePagination(overrides?: Partial<PaginationMeta>): PaginationMeta {
  return {
    page: 1,
    limit: 20,
    total: 1,
    total_pages: 1,
    has_next_page: false,
    ...overrides,
  };
}

async function renderFeedScreen() {
  const view = render(<CustomerEventsScreen />);
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

describe('events feed render', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render screen subtitle', async () => {
    (eventsService.list as jest.Mock).mockResolvedValueOnce({
      data: [],
      pagination: makePagination({ total: 0 }),
    });

    await renderFeedScreen();

    expect(screen.getByText(CUSTOMER.EVENTS_SUBTITLE)).toBeTruthy();
  });

  it('should display event cards when API returns data', async () => {
    (eventsService.list as jest.Mock).mockResolvedValueOnce({
      data: [
        makeEvent({ id: '1', title: 'Summer Festival' }),
        makeEvent({ id: '2', title: 'Tech Conference', category: 'education' }),
      ],
      pagination: makePagination({ total: 2 }),
    });

    await renderFeedScreen();

    await waitFor(() => {
      expect(screen.getByText('Summer Festival')).toBeTruthy();
      expect(screen.getByText('Tech Conference')).toBeTruthy();
    });
  });

  it('should display event description when present', async () => {
    (eventsService.list as jest.Mock).mockResolvedValueOnce({
      data: [makeEvent({ description: 'Annual summer celebration' })],
      pagination: makePagination(),
    });

    await renderFeedScreen();

    await waitFor(() => {
      expect(screen.getByText('Annual summer celebration')).toBeTruthy();
    });
  });

  it('should display translated category label', async () => {
    (eventsService.list as jest.Mock).mockResolvedValueOnce({
      data: [makeEvent({ category: 'music' })],
      pagination: makePagination(),
    });

    await renderFeedScreen();

    await waitFor(() => {
      expect(screen.getByText('Música')).toBeTruthy();
    });
  });
});
