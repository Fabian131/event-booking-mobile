import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CreateEventScreen from '@/app/(admin)/create-event';
import { eventService } from '@/src/services/eventService';
import { router } from 'expo-router';
import React from 'react';

jest.mock('@/src/services/eventService');
jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('@react-native-picker/picker', () => {
  const { TextInput } = require('react-native');
  const Picker = (props: any) => (
    <TextInput
      testID="category-picker"
      value={props.selectedValue}
      onChangeText={props.onValueChange}
      placeholder="category-placeholder"
    />
  );
  Picker.Item = () => null;
  return { Picker };
});

let timePickerCount = 0;

jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = require('react-native');
  return function MockDateTimePicker({ onChange, mode }: any) {
    React.useEffect(() => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      if (mode === 'time') {
        if (timePickerCount === 0) {
          date.setHours(10, 0, 0, 0);
          timePickerCount++;
        } else {
          date.setHours(12, 0, 0, 0);
        }
      }
      setTimeout(() => {
        onChange({ type: 'set' }, date);
      }, 0);
    }, []);
    return <View testID="date-time-picker" />;
  };
});

describe('create event flow', () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.clearAllMocks();
    timePickerCount = 0;
  });

  it('should complete full creation flow and show loading states', async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (eventService.createEvent as jest.Mock).mockReturnValueOnce(pendingPromise);

    render(<CreateEventScreen />);

    // 1. Fill text fields
    fireEvent.changeText(screen.getByPlaceholderText('Nombre del evento'), 'Gran Concierto');
    fireEvent.changeText(screen.getByPlaceholderText('Breve descripción del evento'), 'Un evento espectacular');
    fireEvent.changeText(screen.getByPlaceholderText('Ej. 100'), '500');

    // 2. Fill category
    fireEvent.changeText(screen.getByPlaceholderText('category-placeholder'), 'music');

    // 3. Fill dates
    fireEvent.press(screen.getByText('Selecciona una fecha'));
    await waitFor(() => {
      expect(screen.queryByText('Selecciona una fecha')).toBeNull();
    });

    fireEvent.press(screen.getByText('Selecciona hora de inicio'));
    await waitFor(() => {
      expect(screen.queryByText('Selecciona hora de inicio')).toBeNull();
    });

    fireEvent.press(screen.getByText('Selecciona hora de fin'));
    await waitFor(() => {
      expect(screen.queryByText('Selecciona hora de fin')).toBeNull();
    });

    // 4. Submit form
    fireEvent.press(screen.getByText('Crear Evento'));

    // Verify API called with everything
    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalled();
    });

    // Check loading state (button disabled)
    const submitBtn = screen.getByText('Crear Evento').parent;
    expect(submitBtn?.props.accessibilityState?.disabled).toBe(true);

    // Resolve API
    resolvePromise!({});

    // Verify redirect
    await waitFor(() => {
      expect(router.back).toHaveBeenCalled();
    });
  });
});
