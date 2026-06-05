import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
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

describe('empty login submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show validation errors on empty submit', async () => {
    await renderLoginScreen();

    fireEvent.press(screen.getByText('Ingresar'));

    await waitFor(() => {
      expect(screen.getByText('El correo electrónico es obligatorio')).toBeTruthy();
      expect(screen.getByText('La contraseña es obligatoria')).toBeTruthy();
    });

    expect(authService.login).not.toHaveBeenCalled();
  });
});
