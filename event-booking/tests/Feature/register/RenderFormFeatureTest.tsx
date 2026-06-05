import { render, screen } from '@testing-library/react-native';
import { AuthProvider } from '@/src/context/AuthContext';
import RegisterScreen from '@/app/(auth)/register';

jest.mock('@/src/services/auth');
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: { replace: jest.fn() },
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

describe('register form render', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>,
    );

    expect(screen.getByText('Crear Cuenta')).toBeTruthy();
    expect(screen.getByText('Nombre')).toBeTruthy();
    expect(screen.getByText('Apellido')).toBeTruthy();
    expect(screen.getByText('Correo electronico')).toBeTruthy();
    expect(screen.getByText('Telefono (opcional)')).toBeTruthy();
    expect(screen.getByText('Contrasena')).toBeTruthy();
    expect(screen.getByText('Confirmar contrasena')).toBeTruthy();
    expect(screen.getByText('Registrarse')).toBeTruthy();
  });
});
