import { validateRegistrationForm, type RegisterFormValues } from '@/src/utils/validators';

function base(): RegisterFormValues {
  return {
    first_name: 'Maria', last_name: 'Garcia', email: 'user@example.com',
    phone: '', password: 'Test1234#', confirmPassword: 'Test1234#',
  };
}

describe('confirm password validation', () => {
  it('should reject empty confirmPassword', () => {
    const errors = validateRegistrationForm({ ...base(), confirmPassword: '' });
    expect(errors.some((e) => e.field === 'confirmPassword')).toBe(true);
  });

  it('should reject mismatched passwords', () => {
    const errors = validateRegistrationForm({
      ...base(),
      password: 'Test1234#',
      confirmPassword: 'WrongPass1#',
    });
    expect(errors.some((e) => e.field === 'confirmPassword')).toBe(true);
  });
});
