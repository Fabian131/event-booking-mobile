import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '@/src/context/AuthContext';
import { authService } from '@/src/services/auth';
import { ApiError } from '@/src/types/auth';
import RegisterScreen from '@/app/(auth)/register';

jest.mock('@/src/services/auth');
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: { replace: jest.fn() },
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

function renderWithProviders() {
  return render(
    <AuthProvider>
      <RegisterScreen />
    </AuthProvider>,
  );
}

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    renderWithProviders();

    expect(screen.getByText('Crear Cuenta')).toBeTruthy();
    expect(screen.getByText('Nombre')).toBeTruthy();
    expect(screen.getByText('Apellido')).toBeTruthy();
    expect(screen.getByText('Correo electronico')).toBeTruthy();
    expect(screen.getByText('Telefono (opcional)')).toBeTruthy();
    expect(screen.getByText('Contrasena')).toBeTruthy();
    expect(screen.getByText('Confirmar contrasena')).toBeTruthy();
    expect(screen.getByText('Registrarse')).toBeTruthy();
  });

  it('should show validation errors on empty submit', async () => {
    renderWithProviders();

    fireEvent.press(screen.getByText('Registrarse'));

    await waitFor(() => {
      expect(screen.getByText('El nombre es obligatorio')).toBeTruthy();
      expect(screen.getByText('El apellido es obligatorio')).toBeTruthy();
      expect(screen.getByText('El correo electrónico es obligatorio')).toBeTruthy();
      expect(screen.getByText('La contraseña es obligatoria')).toBeTruthy();
      expect(screen.getByText('Confirma tu contraseña')).toBeTruthy();
    });
  });

  it('should show password mismatch error', async () => {
    renderWithProviders();

    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu nombre'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu apellido'), 'Doe');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu correo'), 'test@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Crea una contrasena'), 'Test1234#');
    fireEvent.changeText(screen.getByPlaceholderText('Confirma tu contrasena'), 'Wrong5678#');

    fireEvent.press(screen.getByText('Registrarse'));

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden')).toBeTruthy();
    });
  });

  it('should show email format error', async () => {
    renderWithProviders();

    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu nombre'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu apellido'), 'Doe');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu correo'), 'notanemail');
    fireEvent.changeText(screen.getByPlaceholderText('Crea una contrasena'), 'Test1234#');
    fireEvent.changeText(screen.getByPlaceholderText('Confirma tu contrasena'), 'Test1234#');

    fireEvent.press(screen.getByText('Registrarse'));

    await waitFor(() => {
      expect(screen.getByText('Ingresa un correo electrónico válido')).toBeTruthy();
    });
  });

  it('should call authService.register on valid form submit', async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce({
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'test@test.com',
      phone: null,
      role: 'customer',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });

    renderWithProviders();

    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu nombre'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu apellido'), 'Doe');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu correo'), 'test@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Crea una contrasena'), 'Test1234#');
    fireEvent.changeText(screen.getByPlaceholderText('Confirma tu contrasena'), 'Test1234#');

    fireEvent.press(screen.getByText('Registrarse'));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@test.com',
        phone: undefined,
        password: 'Test1234#',
      });
    });
  });

  it('should display server validation errors', async () => {
    (authService.register as jest.Mock).mockRejectedValueOnce(
      new ApiError('One or more validation errors occurred', 422, [
        { field: 'email', message: 'Email domain does not exist' },
        { field: 'phone', message: 'Phone must be exactly 8 digits' },
      ]),
    );

    renderWithProviders();

    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu nombre'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu apellido'), 'Doe');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu correo'), 'test@invalid-domain.xyz');
    fireEvent.changeText(screen.getByPlaceholderText('Crea una contrasena'), 'Test1234#');
    fireEvent.changeText(screen.getByPlaceholderText('Confirma tu contrasena'), 'Test1234#');

    fireEvent.press(screen.getByText('Registrarse'));

    await waitFor(() => {
      expect(screen.getByText('Email domain does not exist')).toBeTruthy();
      expect(screen.getByText('Phone must be exactly 8 digits')).toBeTruthy();
    });
  });

  it('should display server network error', async () => {
    (authService.register as jest.Mock).mockRejectedValueOnce(
      new TypeError('Network request failed'),
    );

    renderWithProviders();

    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu nombre'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu apellido'), 'Doe');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu correo'), 'test@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Crea una contrasena'), 'Test1234#');
    fireEvent.changeText(screen.getByPlaceholderText('Confirma tu contrasena'), 'Test1234#');

    fireEvent.press(screen.getByText('Registrarse'));

    await waitFor(() => {
      expect(screen.getByText('No se pudo conectar con el servidor. Verifica tu conexión a internet.')).toBeTruthy();
    });
  });
});
