import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CreateEventScreen from '@/app/(admin)/create-event';
import { eventService } from '@/src/services/eventService';

jest.mock('@/src/services/eventService');
jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

describe('empty form submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not call API and should show validation errors when submitting empty form', async () => {
    render(<CreateEventScreen />);

    fireEvent.press(screen.getByText('Crear Evento'));

    await waitFor(() => {
      expect(screen.getByText('El título es obligatorio')).toBeTruthy();
      expect(screen.getByText('La capacidad máxima es obligatoria')).toBeTruthy();
      expect(screen.getByText('La categoría es obligatoria')).toBeTruthy();
      expect(screen.getByText('La fecha es obligatoria')).toBeTruthy();
    });

    expect(eventService.createEvent).not.toHaveBeenCalled();
  });
});
