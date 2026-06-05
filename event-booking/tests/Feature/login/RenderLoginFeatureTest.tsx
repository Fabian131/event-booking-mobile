import { act, render, screen } from '@testing-library/react-native';
import { AuthProvider } from '@/src/context/AuthContext';
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

describe('login form render', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all login form fields', async () => {
    await renderLoginScreen();

    expect(screen.getByText('Iniciar Sesion')).toBeTruthy();
    expect(screen.getByText('Accede al dashboard administrativo')).toBeTruthy();
    expect(screen.getByText('Correo electronico')).toBeTruthy();
    expect(screen.getByText('Contrasena')).toBeTruthy();
    expect(screen.getByPlaceholderText('Ingresa tu correo')).toBeTruthy();
    expect(screen.getByPlaceholderText('Ingresa tu contrasena')).toBeTruthy();
    expect(screen.getByText('Ingresar')).toBeTruthy();
    expect(screen.getByText('Registrate')).toBeTruthy();
  });
});
