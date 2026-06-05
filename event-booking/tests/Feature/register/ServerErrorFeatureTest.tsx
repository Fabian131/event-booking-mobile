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

describe('server validation errors', () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display server errors from API details array', async () => {
    (authService.register as jest.Mock).mockRejectedValueOnce(
      new ApiError('One or more validation errors occurred', 422, [
        { field: 'email', message: 'Email domain does not exist' },
        { field: 'phone', message: 'Phone must be exactly 8 digits' },
      ]),
    );

    render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>,
    );

    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu nombre'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu apellido'), 'Doe');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu correo'), 'test@invalid-domain.xyz');
    fireEvent.changeText(screen.getByPlaceholderText('Crea una contrasena'), 'Test1234#');
    fireEvent.changeText(screen.getByPlaceholderText('Confirma tu contrasena'), 'Test1234#');

    fireEvent.press(screen.getByText('Registrarse'));

    await waitFor(() => {
      expect(screen.getByText('Email domain does not exist')).toBeTruthy();
      expect(screen.getByText('Phone must be exactly 8 digits')).toBeTruthy();
    });
  });
});
