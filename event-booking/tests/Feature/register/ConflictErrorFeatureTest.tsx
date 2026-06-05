import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '@/src/context/AuthContext';
import { authService } from '@/src/services/auth';
import { ApiError } from '@/src/types/auth';
import RegisterScreen from '@/app/(auth)/register';

jest.mock('@/src/services/auth');
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: { replace: jest.fn() },
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

describe('409 conflict error', () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display field errors when email is already registered (409)', async () => {
    (authService.register as jest.Mock).mockRejectedValueOnce(
      new ApiError('One or more validation errors occurred', 409, [
        { field: 'email', message: 'Email already registered' },
      ]),
    );

    render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>,
    );

    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu nombre'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu apellido'), 'Doe');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu correo'), 'existing@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Crea una contraseña'), 'Test1234#');
    fireEvent.changeText(screen.getByPlaceholderText('Confirma tu contraseña'), 'Test1234#');

    fireEvent.press(screen.getByText('Registrarse'));

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeTruthy();
    });
  });

  it('should display field errors when phone is already registered (409)', async () => {
    (authService.register as jest.Mock).mockRejectedValueOnce(
      new ApiError('One or more validation errors occurred', 409, [
        { field: 'phone', message: 'Phone number already registered' },
      ]),
    );

    render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>,
    );

    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu nombre'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu apellido'), 'Doe');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu correo'), 'john@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu teléfono'), '12345678');
    fireEvent.changeText(screen.getByPlaceholderText('Crea una contraseña'), 'Test1234#');
    fireEvent.changeText(screen.getByPlaceholderText('Confirma tu contraseña'), 'Test1234#');

    fireEvent.press(screen.getByText('Registrarse'));

    await waitFor(() => {
      expect(screen.getByText('Phone number already registered')).toBeTruthy();
    });
  });
});
