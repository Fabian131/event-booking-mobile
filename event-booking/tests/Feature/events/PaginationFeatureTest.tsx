import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { FlatList } from 'react-native';
import { eventsService } from '@/src/services/events';
import CustomerEventsScreen from '@/app/(customer)/events/index';
import type { EventSummary, PaginationMeta } from '@/src/types/events';

jest.mock('@/src/services/events');
jest.mock('expo-image', () => ({
  Image: 'Image',
}));
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

function makeEvent(overrides?: Partial<EventSummary>): EventSummary {
  return {
    id: '1',
    title: 'Event',
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

function makePagination(overrides?: Partial<PaginationMeta>): PaginationMeta {
  return {
    page: 1,
    limit: 20,
    total: 40,
    total_pages: 2,
    has_next_page: true,
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

describe('pagination', () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should append page 2 events when onEndReached fires and next page exists', async () => {
    (eventsService.list as jest.Mock)
      .mockResolvedValueOnce({
        data: [makeEvent({ id: '1', title: 'Page 1 Event' })],
        pagination: makePagination({ page: 1, has_next_page: true }),
      })
      .mockResolvedValueOnce({
        data: [makeEvent({ id: '2', title: 'Page 2 Event' })],
        pagination: makePagination({ page: 2, has_next_page: false }),
      });

    await renderFeedScreen();

    await waitFor(() => {
      expect(screen.getByText('Page 1 Event')).toBeTruthy();
    });

    await act(async () => {
      fireEvent(screen.UNSAFE_getByType(FlatList), 'onEndReached');
    });

    await waitFor(() => {
      expect(screen.getByText('Page 2 Event')).toBeTruthy();
    });

    expect(screen.getByText('Page 1 Event')).toBeTruthy();
    expect(eventsService.list).toHaveBeenCalledTimes(2);
    expect(eventsService.list).toHaveBeenNthCalledWith(2, { page: 2, limit: 20 });
  });

  it('should not fetch when has_next_page is false', async () => {
    (eventsService.list as jest.Mock).mockResolvedValueOnce({
      data: [makeEvent({ id: '1', title: 'Only Event' })],
      pagination: makePagination({ has_next_page: false, total_pages: 1 }),
    });

    await renderFeedScreen();

    await waitFor(() => {
      expect(screen.getByText('Only Event')).toBeTruthy();
    });

    fireEvent(screen.UNSAFE_getByType(FlatList), 'onEndReached');

    expect(eventsService.list).toHaveBeenCalledTimes(1);
  });

  it('should not send duplicate requests when onEndReached fires rapidly', async () => {
    (eventsService.list as jest.Mock).mockResolvedValueOnce({
      data: [makeEvent({ id: '1', title: 'Page 1 Event' })],
      pagination: makePagination({ page: 1, has_next_page: true }),
    });

    let resolvePage2!: (value: unknown) => void;
    const page2Promise = new Promise<unknown>((resolve) => {
      resolvePage2 = resolve;
    });
    (eventsService.list as jest.Mock).mockImplementationOnce(() => page2Promise);

    await renderFeedScreen();

    await waitFor(() => {
      expect(screen.getByText('Page 1 Event')).toBeTruthy();
    });

    const list = screen.UNSAFE_getByType(FlatList);
    fireEvent(list, 'onEndReached');
    fireEvent(list, 'onEndReached');
    fireEvent(list, 'onEndReached');

    await act(async () => {
      resolvePage2({
        data: [makeEvent({ id: '2', title: 'Page 2 Event' })],
        pagination: makePagination({ page: 2, has_next_page: false }),
      });
    });

    expect(eventsService.list).toHaveBeenCalledTimes(2);
  });
});
