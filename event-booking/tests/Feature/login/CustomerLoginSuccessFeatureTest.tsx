import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
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

describe('customer login success', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should persist the session and redirect to customer tabs', async () => {
    (authService.login as jest.Mock).mockResolvedValueOnce({
      access_token: 'customer-token',
      token_type: 'bearer',
      expires_in: 1800,
      user: {
        id: 'customer-001',
        first_name: 'Maria',
        last_name: 'Garcia',
        email: 'maria@example.com',
        role: 'customer',
      },
    });

    await renderLoginScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu correo'), 'maria@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu contraseña'), 'CustomerPassword123#');
    fireEvent.press(screen.getByText('Ingresar'));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'maria@example.com',
        password: 'CustomerPassword123#',
      });
    });

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/(customer)/events');
    });

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'customer-token');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'auth_user',
      JSON.stringify({
        id: 'customer-001',
        first_name: 'Maria',
        last_name: 'Garcia',
        email: 'maria@example.com',
        role: 'customer',
      }),
    );
  });
});

