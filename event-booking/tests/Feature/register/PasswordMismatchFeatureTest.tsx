import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '@/src/context/AuthContext';
import RegisterScreen from '@/app/(auth)/register';

jest.mock('@/src/services/auth');
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: { replace: jest.fn() },
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

describe('password mismatch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show error when passwords do not match', async () => {
    render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>,
    );

    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu nombre'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu apellido'), 'Doe');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu correo'), 'test@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Crea una contrasena'), 'Test1234#');
    fireEvent.changeText(screen.getByPlaceholderText('Confirma tu contrasena'), 'Wrong5678#');

    fireEvent.press(screen.getByText('Registrarse'));

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden')).toBeTruthy();
    });
  });
});
