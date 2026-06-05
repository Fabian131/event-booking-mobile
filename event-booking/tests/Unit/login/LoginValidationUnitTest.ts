import { validateLoginForm, type LoginFormValues } from '@/src/utils/validators';

function base(): LoginFormValues {
  return {
    email: 'admin@example.com',
    password: 'AnyPassword',
  };
}

describe('login validation', () => {
  it('should accept valid login input', () => {
    const errors = validateLoginForm(base());

    expect(errors).toHaveLength(0);
  });

  it('should reject empty email', () => {
    const errors = validateLoginForm({ ...base(), email: '' });

    expect(errors).toContainEqual({
      field: 'email',
      message: 'El correo electrónico es obligatorio',
    });
  });

  it('should reject invalid email format', () => {
    const errors = validateLoginForm({ ...base(), email: 'notanemail' });

    expect(errors).toContainEqual({
      field: 'email',
      message: 'Ingresa un correo electrónico válido',
    });
  });

  it('should reject empty password', () => {
    const errors = validateLoginForm({ ...base(), password: '' });

    expect(errors).toContainEqual({
      field: 'password',
      message: 'La contraseña es obligatoria',
    });
  });

  it('should not enforce registration password strength rules', () => {
    const errors = validateLoginForm({ ...base(), password: 'x' });

    expect(errors.filter((error) => error.field === 'password')).toHaveLength(0);
  });
});
