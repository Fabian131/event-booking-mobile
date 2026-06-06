import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CreateEventScreen from '@/app/(admin)/create-event';
import { eventService } from '@/src/services/eventService';

jest.mock('@/src/services/eventService');
jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));
// DateTimePicker is only used on Android in the new implementation.
// Provide a minimal mock so the module resolves without errors.
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

describe('empty form submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not call API and should show all validation errors when submitting empty form', async () => {
    render(<CreateEventScreen />);

    fireEvent.press(screen.getByText('Crear Evento'));

    await waitFor(() => {
      // Text field errors (messages come from validators.ts, still have accents)
      expect(screen.getByText('El título es obligatorio')).toBeTruthy();
      expect(screen.getByText('La capacidad máxima es obligatoria')).toBeTruthy();
      // Selector errors
      expect(screen.getByText('La categoría es obligatoria')).toBeTruthy();
      expect(screen.getByText('La fecha es obligatoria')).toBeTruthy();
      // Time errors
      expect(screen.getByText('La hora de inicio es obligatoria')).toBeTruthy();
      expect(screen.getByText('La hora de fin es obligatoria')).toBeTruthy();
    });

    expect(eventService.createEvent).not.toHaveBeenCalled();
  });
});
