import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { eventsService } from '@/src/services/events';
import EventDetailScreen from '@/app/(customer)/events/[id]';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';
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
  useRouter: jest.fn(),
}));
jest.mock('@/src/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => (() => void) | void) => {
    const { useEffect } = require('react');
    useEffect(() => {
      const cleanup = cb();
      return cleanup;
    }, []);
  },
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

describe('auth guard', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (eventsService.getById as jest.Mock).mockResolvedValue(makeEvent());
  });

  it('should show login modal when unauthenticated user taps Reservar', async () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });

    await renderDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('Reservar')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Reservar'));

    await waitFor(() => {
      expect(screen.getByText('Inicia sesión para continuar')).toBeTruthy();
      expect(screen.getByText('Necesitas una cuenta para reservar este evento.')).toBeTruthy();
    });
  });

  it('should not navigate when unauthenticated user taps Reservar', async () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });

    await renderDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('Reservar')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Reservar'));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should navigate to login when modal login button is pressed', async () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });

    await renderDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('Reservar')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Reservar'));

    await waitFor(() => {
      expect(screen.getByText('Iniciar sesión')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Iniciar sesión'));

    expect(mockPush).toHaveBeenCalledWith('/(auth)/login');
  });

  it('should close modal when Cancelar is pressed', async () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });

    await renderDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('Reservar')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Reservar'));

    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Cancelar'));

    await waitFor(() => {
      expect(screen.queryByText('Inicia sesión para continuar')).toBeNull();
    });
  });

  it('should navigate to reservations when authenticated user taps Reservar', async () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });

    await renderDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('Reservar')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Reservar'));

    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(customer)/events/book', params: { event_id: '1' } });
  });

  it('should not show modal when authenticated user taps Reservar', async () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });

    await renderDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('Reservar')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Reservar'));

    expect(screen.queryByText('Inicia sesión para continuar')).toBeNull();
  });
});
