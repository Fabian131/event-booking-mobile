import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { AuthProvider } from '@/src/context/AuthContext';
import { authService } from '@/src/services/auth';
import { ApiError } from '@/src/types/auth';
import { SERVER_ERROR, VALIDATION } from '@/src/constants/ui';
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

describe('server validation error', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display field errors and validation banner on 422', async () => {
    (authService.login as jest.Mock).mockRejectedValueOnce(
      new ApiError('One or more validation errors occurred', 422, [
        { field: 'email', message: 'Email must be a valid email address' },
        { field: 'password', message: 'Password is required' },
      ]),
    );

    await renderLoginScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu correo'), 'user@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu contraseña'), 'AnyPassword1');
    fireEvent.press(screen.getByText('Ingresar'));

    await waitFor(() => {
      expect(screen.getByText(SERVER_ERROR.EMAIL_INVALID)).toBeTruthy();
      expect(screen.getByText(VALIDATION.PASSWORD_REQUIRED)).toBeTruthy();
    });

    expect(screen.getByText('Revisa los campos ingresados e intenta nuevamente.')).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
