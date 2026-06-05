import { validateRegistrationForm, type RegisterFormValues } from '@/src/utils/validators';

function base(): RegisterFormValues {
  return {
    first_name: 'Maria', last_name: 'Garcia', email: 'user@example.com',
    phone: '', password: 'Test1234#', confirmPassword: 'Test1234#',
  };
}

describe('last name validation', () => {
  it('should reject empty last_name', () => {
    const errors = validateRegistrationForm({ ...base(), last_name: '' });
    expect(errors.some((e) => e.field === 'last_name')).toBe(true);
  });

  it('should reject last_name shorter than 2 characters', () => {
    const errors = validateRegistrationForm({ ...base(), last_name: 'A' });
    expect(errors.some((e) => e.field === 'last_name')).toBe(true);
  });

  it('should reject last_name with numbers', () => {
    const errors = validateRegistrationForm({ ...base(), last_name: 'D0e' });
    expect(errors.some((e) => e.field === 'last_name')).toBe(true);
  });
});
