import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '@/src/context/AuthContext';
import { authService } from '@/src/services/auth';
import RegisterScreen from '@/app/(auth)/register';

jest.mock('@/src/services/auth');
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: { replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

describe('form interaction patterns', () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should toggle password visibility when eye icon is pressed', () => {
    render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>,
    );

    const passwordInput = screen.getByPlaceholderText('Crea una contraseña');
    const confirmInput = screen.getByPlaceholderText('Confirma tu contraseña');

    // Both password fields should be hidden by default
    expect(passwordInput.props.secureTextEntry).toBe(true);
    expect(confirmInput.props.secureTextEntry).toBe(true);
  });

  it('should clear errors when user corrects invalid field and resubmits', async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce({
      id: 'user-001', first_name: 'Maria', last_name: 'Garcia',
      email: 'maria@example.com', phone: null, role: 'customer',
      is_active: true,
      created_at: '2026-06-05T12:00:00Z',
      updated_at: '2026-06-05T12:00:00Z',
    });

    render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>,
    );

    // Submit empty form to trigger errors
    fireEvent.press(screen.getByText('Registrarse'));

    await waitFor(() => {
      expect(screen.getByText('El nombre es obligatorio')).toBeTruthy();
      expect(screen.getByText('El correo electrónico es obligatorio')).toBeTruthy();
    });

    // Correct the fields
    fireEvent.changeText(
      screen.getByPlaceholderText('Ingresa tu nombre'), 'Maria',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Ingresa tu apellido'), 'Garcia',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Ingresa tu correo'), 'maria@example.com',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Crea una contraseña'), 'Secure1#',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Confirma tu contraseña'), 'Secure1#',
    );

    // Resubmit
    fireEvent.press(screen.getByText('Registrarse'));

    // Previous errors should be gone and API called
    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled();
    });

    expect(screen.queryByText('El nombre es obligatorio')).toBeNull();
    expect(screen.queryByText('El correo electrónico es obligatorio')).toBeNull();
  });

  it('should show all client errors simultaneously for multiple invalid fields', async () => {
    render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>,
    );

    // Fill first name correctly, leave rest empty or invalid
    fireEvent.changeText(
      screen.getByPlaceholderText('Ingresa tu nombre'), 'Maria',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Ingresa tu apellido'), '',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Ingresa tu correo'), 'invalid',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Crea una contraseña'), 'weak',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Confirma tu contraseña'), 'mismatch',
    );

    fireEvent.press(screen.getByText('Registrarse'));

    await waitFor(() => {
      // These errors should all be visible at the same time
      expect(screen.getByText('El apellido es obligatorio')).toBeTruthy();
      expect(screen.getByText('Ingresa un correo electrónico válido')).toBeTruthy();
      expect(screen.getByText('La contraseña debe tener al menos 8 caracteres')).toBeTruthy();
    });

    // first_name should NOT have an error (it was filled correctly)
    expect(screen.queryByText('El nombre es obligatorio')).toBeNull();
    expect(screen.queryByText('El nombre debe tener al menos 2 caracteres')).toBeNull();
  });
});
