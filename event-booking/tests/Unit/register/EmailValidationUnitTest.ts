import { validateRegistrationForm, type RegisterFormValues } from '@/src/utils/validators';

function base(): RegisterFormValues {
  return {
    first_name: 'Maria', last_name: 'Garcia', email: 'user@example.com',
    phone: '', password: 'Test1234#', confirmPassword: 'Test1234#',
  };
}

describe('email validation', () => {
  it('should reject empty email', () => {
    const errors = validateRegistrationForm({ ...base(), email: '' });
    expect(errors.some((e) => e.field === 'email')).toBe(true);
  });

  it('should reject invalid email format', () => {
    const errors = validateRegistrationForm({ ...base(), email: 'notanemail' });
    expect(errors.some((e) => e.field === 'email')).toBe(true);
  });

  it('should reject email without domain', () => {
    const errors = validateRegistrationForm({ ...base(), email: 'user@' });
    expect(errors.some((e) => e.field === 'email')).toBe(true);
  });
});
