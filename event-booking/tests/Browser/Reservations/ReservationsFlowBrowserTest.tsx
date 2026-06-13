import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { reservationsService } from '@/src/services/reservations';
import { eventsService } from '@/src/services/events';
import AdminEventDetailScreen from '@/app/(admin)/events/[id]';
import type { Event } from '@/src/types/events';
import type { Reservation } from '@/src/types/reservations';

let storedFocusCallback: (() => (() => void) | void) | null = null;

jest.mock('@/src/services/reservations');
jest.mock('@/src/services/events');
jest.mock('expo-image', () => ({
  Image: 'Image',
}));
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ id: 'evt-1' })),
  useRouter: jest.fn(() => ({ push: mockPush })),
  Stack: { Screen: () => null },
}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => (() => void) | void) => {
    storedFocusCallback = cb;
    const { useEffect } = require('react');
    useEffect(() => {
      const cleanup = cb();
      return cleanup;
    }, []);
  },
}));

function makeEvent(overrides?: Partial<Event>): Event {
  return {
    id: 'evt-1',
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

function makeReservation(overrides?: Partial<Reservation>): Reservation {
  return {
    id: 'res-1',
    event_id: 'evt-1',
    event_title: 'Summer Festival',
    event_date: '2026-07-15',
    event_start_time: '10:00:00',
    event_end_time: '18:00:00',
    ticket_quantity: 2,
    status: 'CONFIRMED',
    notes: null,
    user: {
      user_id: 'user-1',
      user_name: 'John Doe',
      user_email: 'john@example.com',
    },
    created_at: '2026-06-01T00:00:00+00:00',
    ...overrides,
  };
}

function makePagination(overrides?: Record<string, unknown>) {
  return {
    page: 1,
    limit: 100,
    total: 1,
    total_pages: 1,
    has_next_page: false,
    ...overrides,
  };
}

async function renderDetailScreen() {
  storedFocusCallback = null;
  const view = render(<AdminEventDetailScreen />);
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

describe('reservations full flow', () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.clearAllMocks();
    storedFocusCallback = null;
  });

  it('should navigate to reservations and show correct capacity', async () => {
    (eventsService.getById as jest.Mock).mockResolvedValueOnce(makeEvent({
      remaining_capacity: 50,
    }));

    await renderDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('Cupos disponibles')).toBeTruthy();
      expect(screen.getByText('50')).toBeTruthy();
    });

    expect(screen.getByText('Ver Reservaciones')).toBeTruthy();
    fireEvent.press(screen.getByText('Ver Reservaciones'));

    expect(mockPush).toHaveBeenCalledWith('/(admin)/reservations/evt-1');
  });

  it('should update remaining_capacity after refocus', async () => {
    (eventsService.getById as jest.Mock).mockResolvedValue(makeEvent({ remaining_capacity: 50 }));

    await renderDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('50')).toBeTruthy();
    });

    (eventsService.getById as jest.Mock).mockResolvedValue(makeEvent({ remaining_capacity: 47 }));

    await act(async () => {
      if (storedFocusCallback) {
        storedFocusCallback();
      }
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText('47')).toBeTruthy();
    });
  });
});
