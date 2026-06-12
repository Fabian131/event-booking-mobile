import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { eventsService } from '@/src/services/events';
import { reservationsService } from '@/src/services/reservations';
import BookScreen from '@/app/(customer)/events/book';
import type { Event } from '@/src/types/events';
import { ApiError } from '@/src/types/auth';
import type { FieldError } from '@/src/types/auth';

jest.mock('@/src/services/events');
jest.mock('@/src/services/reservations');
jest.mock('expo-image', () => ({
  Image: 'Image',
}));
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ event_id: '1' })),
  useRouter: jest.fn(),
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

async function renderBookScreen() {
  const view = render(<BookScreen />);
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

describe('booking form', () => {
  const mockBack = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const { useRouter } = require('expo-router');
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: jest.fn(), replace: mockReplace });
    (eventsService.getById as jest.Mock).mockResolvedValue(makeEvent());
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render form with event details, quantity input and submit button', async () => {
    await renderBookScreen();

    await waitFor(() => {
      expect(screen.getByText('Summer Festival')).toBeTruthy();
    });

    expect(screen.getByText('Cantidad de entradas')).toBeTruthy();
    expect(screen.getByDisplayValue('1')).toBeTruthy();
    expect(screen.getByText('Confirmar reserva')).toBeTruthy();
  });

  it('should increment and decrement quantity via stepper buttons', async () => {
    const event = makeEvent({ remaining_capacity: 10 });
    (eventsService.getById as jest.Mock).mockResolvedValue(event);

    await renderBookScreen();

    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('Aumentar cantidad'));
    expect(screen.getByDisplayValue('2')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Aumentar cantidad'));
    expect(screen.getByDisplayValue('3')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Reducir cantidad'));
    expect(screen.getByDisplayValue('2')).toBeTruthy();
  });

  it('should allow typing quantity directly', async () => {
    const event = makeEvent({ remaining_capacity: 10 });
    (eventsService.getById as jest.Mock).mockResolvedValue(event);

    await renderBookScreen();

    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeTruthy();
    });

    const input = screen.getByDisplayValue('1');
    fireEvent.changeText(input, '5');

    expect(screen.getByDisplayValue('5')).toBeTruthy();
  });

  it('should clamp typed quantity to remaining capacity on blur', async () => {
    const event = makeEvent({ remaining_capacity: 3 });
    (eventsService.getById as jest.Mock).mockResolvedValue(event);

    await renderBookScreen();

    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeTruthy();
    });

    const input = screen.getByDisplayValue('1');
    fireEvent.changeText(input, '99');
    fireEvent(input, 'blur');

    expect(screen.getByDisplayValue('3')).toBeTruthy();
  });

  it('should show sold out state when remaining capacity is zero', async () => {
    const event = makeEvent({ remaining_capacity: 0 });
    (eventsService.getById as jest.Mock).mockResolvedValue(event);

    await renderBookScreen();

    await waitFor(() => {
      expect(screen.getByText('Agotado')).toBeTruthy();
    });

    expect(screen.getByText('Volver al evento')).toBeTruthy();
  });

  it('should show success banner and navigate to event detail after delay', async () => {
    (reservationsService.create as jest.Mock).mockResolvedValue({ id: 'res-1' });

    await renderBookScreen();

    await waitFor(() => {
      expect(screen.getByText('Confirmar reserva')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Confirmar reserva'));

    await waitFor(() => {
      expect(reservationsService.create).toHaveBeenCalledWith({
        event_id: '1',
        ticket_quantity: 1,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Reserva realizada con éxito. Redirigiendo...')).toBeTruthy();
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/(customer)/events/[id]',
      params: { id: '1' },
    });
  });

  it('should display error banner on network failure', async () => {
    (reservationsService.create as jest.Mock).mockRejectedValue(new TypeError('Network error'));

    await renderBookScreen();

    await waitFor(() => {
      expect(screen.getByText('Confirmar reserva')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Confirmar reserva'));

    await waitFor(() => {
      expect(screen.getByText('No se pudo conectar con el servidor. Verifica tu conexión a internet.')).toBeTruthy();
    });
  });

  it('should display Spanish capacity error on 409 with server message', async () => {
    (reservationsService.create as jest.Mock).mockRejectedValue(
      new ApiError('Only 2 slots available, requested 5', 409),
    );

    await renderBookScreen();

    await waitFor(() => {
      expect(screen.getByText('Confirmar reserva')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Confirmar reserva'));

    await waitFor(() => {
      expect(screen.getByText('La cantidad solicitada excede los cupos disponibles.')).toBeTruthy();
    });
  });

  it('should display Spanish duplicate error on 409 with FastAPI details', async () => {
    const details: FieldError[] = [
      { field: 'event_id', message: 'You already have an active reservation for this event' },
    ];
    (reservationsService.create as jest.Mock).mockRejectedValue(
      new ApiError('Errores de validación', 409, details),
    );

    await renderBookScreen();

    await waitFor(() => {
      expect(screen.getByText('Confirmar reserva')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Confirmar reserva'));

    await waitFor(() => {
      expect(screen.getByText('Ya tienes una reserva activa para este evento.')).toBeTruthy();
    });
  });

  it('should display Spanish event unavailable message on 400', async () => {
    const details: FieldError[] = [
      { field: 'event_id', message: 'Cannot reserve a past event' },
    ];
    (reservationsService.create as jest.Mock).mockRejectedValue(
      new ApiError('Errores de validación', 400, details),
    );

    await renderBookScreen();

    await waitFor(() => {
      expect(screen.getByText('Confirmar reserva')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Confirmar reserva'));

    await waitFor(() => {
      expect(screen.getByText('Este evento ya no está disponible para reservar.')).toBeTruthy();
    });
  });

  it('should include notes when provided', async () => {
    (reservationsService.create as jest.Mock).mockResolvedValue({ id: 'res-1' });
    const event = makeEvent({ remaining_capacity: 5 });
    (eventsService.getById as jest.Mock).mockResolvedValue(event);

    await renderBookScreen();

    await waitFor(() => {
      expect(screen.getByText('Confirmar reserva')).toBeTruthy();
    });

    const notesInput = screen.getByPlaceholderText('Ej: Necesito acceso para silla de ruedas');
    fireEvent.changeText(notesInput, 'Accessible seating');

    fireEvent.press(screen.getByText('Confirmar reserva'));

    await waitFor(() => {
      expect(reservationsService.create).toHaveBeenCalledWith({
        event_id: '1',
        ticket_quantity: 1,
        notes: 'Accessible seating',
      });
    });
  });
});
