import { act, render, screen, waitFor } from '@testing-library/react-native';
import { eventsService } from '@/src/services/events';
import EventDetailScreen from '@/app/(customer)/events/[id]';
import { useAuth } from '@/src/context/AuthContext';
import type { Event } from '@/src/types/events';

jest.mock('@/src/services/events');
jest.mock('expo-image', () => ({
  Image: 'Image',
}));
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ id: '1' })),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));
jest.mock('@/src/context/AuthContext', () => ({
  useAuth: jest.fn(),
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

async function renderDetailScreen() {
  const view = render(<EventDetailScreen />);
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

describe('event detail render', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
  });

  it('should display event title', async () => {
    (eventsService.getById as jest.Mock).mockResolvedValueOnce(makeEvent({ title: 'Summer Festival' }));

    await renderDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('Summer Festival')).toBeTruthy();
    });
  });

  it('should display event description', async () => {
    (eventsService.getById as jest.Mock).mockResolvedValueOnce(
      makeEvent({ description: 'Annual summer celebration' }),
    );

    await renderDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('Annual summer celebration')).toBeTruthy();
    });
  });

  it('should display translated category label', async () => {
    (eventsService.getById as jest.Mock).mockResolvedValueOnce(makeEvent({ category: 'music' }));

    await renderDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('Música')).toBeTruthy();
    });
  });

  it('should display info row labels for date and time', async () => {
    (eventsService.getById as jest.Mock).mockResolvedValueOnce(makeEvent());

    await renderDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('Fecha')).toBeTruthy();
      expect(screen.getByText('Hora de inicio')).toBeTruthy();
      expect(screen.getByText('Hora de fin')).toBeTruthy();
    });
  });

  it('should display capacity info label', async () => {
    (eventsService.getById as jest.Mock).mockResolvedValueOnce(
      makeEvent({ max_capacity: 100, remaining_capacity: 50 }),
    );

    await renderDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('Cupos disponibles')).toBeTruthy();
      expect(screen.getByText('50 de 100 (50%)')).toBeTruthy();
    });
  });

  it('should display Reservar button', async () => {
    (eventsService.getById as jest.Mock).mockResolvedValueOnce(makeEvent());

    await renderDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('Reservar')).toBeTruthy();
    });
  });

  it('should display error state when API fails', async () => {
    (eventsService.getById as jest.Mock).mockRejectedValueOnce(new Error('Not found'));

    await renderDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('Error al cargar el evento')).toBeTruthy();
    });
  });

  it('should not display description section when description is absent', async () => {
    (eventsService.getById as jest.Mock).mockResolvedValueOnce(
      makeEvent({ description: undefined }),
    );

    await renderDetailScreen();

    await waitFor(() => {
      expect(screen.queryByText('Descripción')).toBeNull();
    });
  });
});
