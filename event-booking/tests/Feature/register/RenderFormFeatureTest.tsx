import { render, screen } from '@testing-library/react-native';
import RegisterScreen from '@/app/(auth)/register';

jest.mock('@/src/services/auth');
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: { replace: jest.fn() },
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('@/src/context/AuthContext', () => ({
  useAuth: () => ({
    register: (data: any) => {
      const { authService } = require('@/src/services/auth');
      return authService.register(data);
    },
  }),
}));

describe('register form render', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(
      <RegisterScreen />
    );

    expect(screen.getByText('Crear Cuenta')).toBeTruthy();
    expect(screen.getByText('Nombre')).toBeTruthy();
    expect(screen.getByText('Apellido')).toBeTruthy();
    expect(screen.getByText('Correo electrónico')).toBeTruthy();
    expect(screen.getByText('Teléfono (opcional)')).toBeTruthy();
    expect(screen.getByText('Contraseña')).toBeTruthy();
    expect(screen.getByText('Confirmar contraseña')).toBeTruthy();
    expect(screen.getByText('Registrarse')).toBeTruthy();
  });
});
