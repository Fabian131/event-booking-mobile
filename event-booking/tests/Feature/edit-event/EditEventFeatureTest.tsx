import { Alert } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import EditEventScreen from '@/app/(admin)/edit-event/[id]';
import { eventsService } from '@/src/services/events';
import { ApiError } from '@/src/types/auth';
import type { Event } from '@/src/types/events';

const mockRouterBack = jest.fn();

jest.mock('@/src/services/events');
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ id: 'event-1' })),
  useRouter: jest.fn(() => ({ back: mockRouterBack })),
}));
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => (() => void) | void) => {
    const { useEffect } = require('react');
    useEffect(() => {
      const cleanup = cb();
      return cleanup;
    }, []);
  },
}));

jest.mock('@/src/utils/validators', () => {
  const original = jest.requireActual('@/src/utils/validators');
  return {
    ...original,
    validateCreateEventForm: jest.fn(() => []),
  };
});

function makeEvent(overrides?: Partial<Event>): Event {
  return {
    id: 'event-1',
    title: 'Original Event',
    description: 'Original description',
    image_url: 'https://cdn.example.com/original.jpg',
    max_capacity: 100,
    remaining_capacity: 80,
    category: 'music',
    date: '2099-07-15',
    start_time: '10:00:00',
    end_time: '12:00:00',
    is_active: true,
    created_at: '2026-06-01T00:00:00+00:00',
    updated_at: '2026-06-01T00:00:00+00:00',
    ...overrides,
  };
}

async function renderEditScreen(event: Event = makeEvent()) {
  (eventsService.getById as jest.Mock).mockResolvedValueOnce(event);

  render(<EditEventScreen />);

  await waitFor(() => {
    expect(screen.getByDisplayValue(event.title)).toBeTruthy();
  });
}

function confirmNextAlert() {
  jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
    buttons?.[1]?.onPress?.();
  });
}

function getFormDataParts(formData: FormData) {
  const nativeParts = (formData as unknown as { _parts?: [string, unknown][] })._parts;
  if (nativeParts) return nativeParts;

  return Array.from((formData as unknown as { entries: () => Iterable<[string, unknown]> }).entries());
}

describe('edit event screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('pre-populates fields from the loaded event', async () => {
    await renderEditScreen(makeEvent({ title: 'Prefilled Event', max_capacity: 250 }));

    expect(screen.getByDisplayValue('Prefilled Event')).toBeTruthy();
    expect(screen.getByDisplayValue('Original description')).toBeTruthy();
    expect(screen.getByDisplayValue('250')).toBeTruthy();
    expect(screen.getByText('Música')).toBeTruthy();
    expect(screen.getByText('2099-07-15')).toBeTruthy();
  });

  it('does not send update when confirmation is dismissed', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    await renderEditScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Guardar Cambios' }));

    expect(alertSpy).toHaveBeenCalled();
    expect(eventsService.update).not.toHaveBeenCalled();
  });

  it('sends update after confirmation and applies returned image URL', async () => {
    confirmNextAlert();
    (eventsService.update as jest.Mock).mockResolvedValueOnce(
      makeEvent({ image_url: 'https://cdn.example.com/updated.jpg' }),
    );

    await renderEditScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Guardar Cambios' }));

    await waitFor(() => {
      expect(eventsService.update).toHaveBeenCalledWith('event-1', expect.any(FormData));
    });

    const formData = (eventsService.update as jest.Mock).mock.calls[0][1] as FormData;
    expect(getFormDataParts(formData).some(([key]) => key === 'image')).toBe(false);

    await waitFor(() => {
      expect(screen.getByText('Evento actualizado exitosamente.')).toBeTruthy();
      expect(screen.getByLabelText('Vista previa de la imagen del evento').props.source).toEqual({
        uri: 'https://cdn.example.com/updated.jpg',
      });
    });

    await waitFor(() => {
      expect(mockRouterBack).toHaveBeenCalled();
    }, { timeout: 2000, interval: 100 });
  });

  it('displays translated schedule conflict error', async () => {
    confirmNextAlert();
    (eventsService.update as jest.Mock).mockRejectedValueOnce(
      new ApiError('Conflict from API', 409, [
        { field: 'schedule', message: 'An event already occupies this date and time slot' },
      ]),
    );

    await renderEditScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Guardar Cambios' }));

    await waitFor(() => {
      expect(eventsService.update).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Ya existe un evento programado en esta fecha y horario. Por favor selecciona otro.')).toBeTruthy();
      expect(screen.queryByText('Conflict from API')).toBeNull();
    });
  });

  it('renders server field validation details without a generic banner', async () => {
    confirmNextAlert();
    (eventsService.update as jest.Mock).mockRejectedValueOnce(
      new ApiError('Validation error', 422, [
        { field: 'title', message: 'Title must be at least 3 characters' },
        { field: 'max_capacity', message: 'Capacity must be a positive integer' },
      ]),
    );

    await renderEditScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Guardar Cambios' }));

    await waitFor(() => {
      expect(eventsService.update).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('El título debe tener al menos 3 caracteres')).toBeTruthy();
      expect(screen.getByText('Capacity must be a positive integer')).toBeTruthy();
      expect(screen.queryByText('Validation error')).toBeNull();
    });
  });
});
