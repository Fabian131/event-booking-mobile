import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { AuthProvider } from '@/src/context/AuthContext';
import { authService } from '@/src/services/auth';
import LoginScreen from '@/app/(auth)/login';

jest.mock('@/src/services/auth');
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: { replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

async function renderLoginScreen() {
  const view = render(
    <AuthProvider>
      <LoginScreen />
    </AuthProvider>,
  );

  await act(async () => {
    await Promise.resolve();
  });

  return view;
}

describe('login flow', () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full business login flow', async () => {
    (authService.login as jest.Mock).mockResolvedValueOnce({
      access_token: 'business-token',
      token_type: 'bearer',
      expires_in: 1800,
      user: {
        id: 'business-001',
        first_name: 'Admin',
        last_name: 'System',
        email: 'admin@example.com',
        role: 'business',
      },
    });

    await renderLoginScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu correo'), 'admin@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu contraseña'), 'YourAdminPassword123#');
    fireEvent.press(screen.getByText('Ingresar'));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: 'YourAdminPassword123#',
      });
    });

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/(admin)');
    });
  });

  it('should disable form fields during login request', async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (authService.login as jest.Mock).mockReturnValueOnce(pendingPromise);

    await renderLoginScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu correo'), 'admin@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu contraseña'), 'YourAdminPassword123#');
    fireEvent.press(screen.getByText('Ingresar'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Ingresa tu correo').props.editable).toBe(false);
      expect(screen.getByPlaceholderText('Ingresa tu contraseña').props.editable).toBe(false);
    });

    resolvePromise!({
      access_token: 'business-token',
      token_type: 'bearer',
      expires_in: 1800,
      user: {
        id: 'business-001',
        first_name: 'Admin',
        last_name: 'System',
        email: 'admin@example.com',
        role: 'business',
      },
    });

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/(admin)');
    });
  });
});
