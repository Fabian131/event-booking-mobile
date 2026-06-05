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

describe('valid form submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call authService.register with correct payload', async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce({
      id: '1', first_name: 'John', last_name: 'Doe', email: 'test@test.com',
      phone: null, role: 'customer', is_active: true,
      created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    });

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
      expect(authService.register).toHaveBeenCalledWith({
        first_name: 'John', last_name: 'Doe', email: 'test@test.com',
        phone: undefined, password: 'Test1234#',
      });
    });
  });
});
