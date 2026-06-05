import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '@/src/context/AuthContext';
import { authService } from '@/src/services/auth';
import RegisterScreen from '@/app/(auth)/register';

jest.mock('@/src/services/auth');
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: { replace: jest.fn() },
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

describe('network error', () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display connection error when server is unreachable', async () => {
    (authService.register as jest.Mock).mockRejectedValueOnce(
      new TypeError('Network request failed'),
    );

    render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>,
    );

    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu nombre'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu apellido'), 'Doe');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu correo'), 'test@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Crea una contrasena'), 'Test1234#');
    fireEvent.changeText(screen.getByPlaceholderText('Confirma tu contrasena'), 'Test1234#');

    fireEvent.press(screen.getByText('Registrarse'));

    await waitFor(() => {
      expect(screen.getByText('No se pudo conectar con el servidor. Verifica tu conexión a internet.')).toBeTruthy();
    });
  });
});
