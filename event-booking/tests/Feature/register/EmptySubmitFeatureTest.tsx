import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '@/src/context/AuthContext';
import RegisterScreen from '@/app/(auth)/register';

jest.mock('@/src/services/auth');
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: { replace: jest.fn() },
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

describe('empty form submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show validation errors on empty submit', async () => {
    render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>,
    );

    fireEvent.press(screen.getByText('Registrarse'));

    await waitFor(() => {
      expect(screen.getByText('El nombre es obligatorio')).toBeTruthy();
      expect(screen.getByText('El apellido es obligatorio')).toBeTruthy();
      expect(screen.getByText('El correo electrónico es obligatorio')).toBeTruthy();
      expect(screen.getByText('La contraseña es obligatoria')).toBeTruthy();
      expect(screen.getByText('Confirma tu contraseña')).toBeTruthy();
    });
  });
});
