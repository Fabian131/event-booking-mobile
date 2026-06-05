import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { AuthProvider } from '@/src/context/AuthContext';
import { authService } from '@/src/services/auth';
import { ApiError } from '@/src/types/auth';
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

describe('invalid login credentials', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show invalid credentials error on 401', async () => {
    (authService.login as jest.Mock).mockRejectedValueOnce(
      new ApiError('Invalid email or password', 401),
    );

    await renderLoginScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu correo'), 'admin@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu contrasena'), 'WrongPassword');
    fireEvent.press(screen.getByText('Ingresar'));

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas. Verifica tu correo y contraseña.')).toBeTruthy();
    });

    expect(router.replace).not.toHaveBeenCalled();
  });
});
