import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { eventsService } from '@/src/services/events';
import AdminEventDetailScreen from '@/app/(admin)/events/[id]';
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

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ id: '1' })),
  useRouter: jest.fn(() => ({ push: mockPush })),
  Stack: { Screen: () => null },
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
  const view = render(<AdminEventDetailScreen />);
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

describe('admin event detail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state before data resolves', () => {
    (eventsService.getById as jest.Mock).mockReturnValueOnce(new Promise(() => {}));
    render(<AdminEventDetailScreen />);
    expect(screen.getByText('Cargando evento...')).toBeTruthy();
  });

  it('should render title, category badge, all InfoRow labels, and footer buttons', async () => {
    (eventsService.getById as jest.Mock).mockResolvedValueOnce(makeEvent());
    await renderDetailScreen();
    await waitFor(() => {
      expect(screen.getByText('Summer Festival')).toBeTruthy();
      expect(screen.getByText('Música')).toBeTruthy();
      expect(screen.getByText('Fecha')).toBeTruthy();
      expect(screen.getByText('Hora de inicio')).toBeTruthy();
      expect(screen.getByText('Hora de fin')).toBeTruthy();
      expect(screen.getByText('Capacidad máxima')).toBeTruthy();
      expect(screen.getByText('Cupos disponibles')).toBeTruthy();
      expect(screen.getByText('Editar')).toBeTruthy();
      expect(screen.getByText('Ver Reservaciones')).toBeTruthy();
    });
  });

  it('should show error state when API fails', async () => {
    (eventsService.getById as jest.Mock).mockRejectedValueOnce(new Error('Not found'));
    await renderDetailScreen();
    await waitFor(() => {
      expect(screen.getByText('Error al cargar el evento')).toBeTruthy();
    });
  });

  it('should show not-found state when event is null', async () => {
    (eventsService.getById as jest.Mock).mockResolvedValueOnce(null);
    await renderDetailScreen();
    await waitFor(() => {
      expect(screen.getByText('Evento no encontrado')).toBeTruthy();
    });
  });

  it('should navigate to edit screen when Editar is pressed', async () => {
    (eventsService.getById as jest.Mock).mockResolvedValueOnce(makeEvent());
    await renderDetailScreen();
    await waitFor(() => expect(screen.getByText('Editar')).toBeTruthy());
    fireEvent.press(screen.getByText('Editar'));
    expect(mockPush).toHaveBeenCalledWith('/(admin)/edit-event/1');
  });

  it('should navigate to reservations when Ver Reservaciones is pressed', async () => {
    (eventsService.getById as jest.Mock).mockResolvedValueOnce(makeEvent());
    await renderDetailScreen();
    await waitFor(() => expect(screen.getByText('Ver Reservaciones')).toBeTruthy());
    fireEvent.press(screen.getByText('Ver Reservaciones'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(admin)/events/[id]/reservations',
      params: { id: '1' },
    });
  });
});
