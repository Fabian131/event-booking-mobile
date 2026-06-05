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

describe('business login success', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should persist the session and redirect to tabs', async () => {
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

    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu correo'), 'Admin@Example.com ');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu contraseña'), 'YourAdminPassword123#');
    fireEvent.press(screen.getByText('Ingresar'));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: 'YourAdminPassword123#',
      });
    });

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/(tabs)');
    });

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'business-token');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'auth_user',
      JSON.stringify({
        id: 'business-001',
        first_name: 'Admin',
        last_name: 'System',
        email: 'admin@example.com',
        role: 'business',
      }),
    );
  });
});
