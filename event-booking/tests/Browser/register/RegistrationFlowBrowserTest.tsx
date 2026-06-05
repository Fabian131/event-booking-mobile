import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '@/src/context/AuthContext';
import { authService } from '@/src/services/auth';
import RegisterScreen from '@/app/(auth)/register';
import { router } from 'expo-router';

jest.mock('@/src/services/auth');
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: { replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

describe('registration flow', () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full registration flow from form fill to login redirect', async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce({
      id: 'user-001', first_name: 'Maria', last_name: 'Garcia',
      email: 'maria@example.com', phone: '87654321', role: 'customer',
      is_active: true,
      created_at: '2026-06-05T12:00:00Z',
      updated_at: '2026-06-05T12:00:00Z',
    });

    render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>,
    );

    // Step 1: Type first name
    fireEvent.changeText(
      screen.getByPlaceholderText('Ingresa tu nombre'), 'Maria',
    );

    // Step 2: Type last name
    fireEvent.changeText(
      screen.getByPlaceholderText('Ingresa tu apellido'), 'Garcia',
    );

    // Step 3: Type email
    fireEvent.changeText(
      screen.getByPlaceholderText('Ingresa tu correo'), 'maria@example.com',
    );

    // Step 4: Type phone
    fireEvent.changeText(
      screen.getByPlaceholderText('Ingresa tu telefono'), '87654321',
    );

    // Step 5: Type password
    fireEvent.changeText(
      screen.getByPlaceholderText('Crea una contrasena'), 'Secure1#',
    );

    // Step 6: Confirm password
    fireEvent.changeText(
      screen.getByPlaceholderText('Confirma tu contrasena'), 'Secure1#',
    );

    // Step 7: Submit
    fireEvent.press(screen.getByText('Registrarse'));

    // Step 8: Verify API was called with all fields
    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        first_name: 'Maria',
        last_name: 'Garcia',
        email: 'maria@example.com',
        phone: '87654321',
        password: 'Secure1#',
      });
    });

    // Step 9: Verify redirect to login
    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith(
        '/(auth)/login?registered=true',
      );
    });
  });

  it('should disable form fields during API request', async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (authService.register as jest.Mock).mockReturnValueOnce(pendingPromise);

    render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>,
    );

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
      screen.getByPlaceholderText('Crea una contrasena'), 'Secure1#',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Confirma tu contrasena'), 'Secure1#',
    );

    fireEvent.press(screen.getByText('Registrarse'));

    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText('Ingresa tu nombre');
      expect(nameInput.props.editable).toBe(false);
    });

    const emailInput = screen.getByPlaceholderText('Ingresa tu correo');
    expect(emailInput.props.editable).toBe(false);

    // Resolve the pending promise
    resolvePromise!({
      id: 'user-001', first_name: 'Maria', last_name: 'Garcia',
      email: 'maria@example.com', phone: null, role: 'customer',
      is_active: true,
      created_at: '2026-06-05T12:00:00Z',
      updated_at: '2026-06-05T12:00:00Z',
    });

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalled();
    });
  });
});
