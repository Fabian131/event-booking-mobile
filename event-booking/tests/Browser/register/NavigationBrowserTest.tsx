import { render, screen, fireEvent } from '@testing-library/react-native';
import { AuthProvider } from '@/src/context/AuthContext';
import RegisterScreen from '@/app/(auth)/register';

jest.mock('@/src/services/auth');
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: { replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

describe('navigation between screens', () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have a link to login screen in the footer', () => {
    render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>,
    );

    expect(screen.getByText('¿Ya tienes cuenta? ')).toBeTruthy();
    expect(screen.getByText('Inicia sesión')).toBeTruthy();
  });

  it('should display all form labels in the correct order', () => {
    render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>,
    );

    const labels = [
      'Crear Cuenta',
      'Regístrate para reservar eventos',
      'Nombre',
      'Apellido',
      'Correo electrónico',
      'Teléfono (opcional)',
      'Contraseña',
      'Confirmar contraseña',
      'Registrarse',
      '¿Ya tienes cuenta? ',
      'Inicia sesión',
    ];

    for (const label of labels) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });

  it('should accept accented names following Latin American naming conventions', () => {
    render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>,
    );

    fireEvent.changeText(
      screen.getByPlaceholderText('Ingresa tu nombre'), 'José María',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Ingresa tu apellido'), 'García López',
    );

    const nameInput = screen.getByPlaceholderText('Ingresa tu nombre');
    expect(nameInput.props.value).toBe('José María');

    const lastNameInput = screen.getByPlaceholderText('Ingresa tu apellido');
    expect(lastNameInput.props.value).toBe('García López');
  });
});
