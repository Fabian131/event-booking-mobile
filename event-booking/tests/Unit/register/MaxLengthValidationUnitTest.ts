import { validateRegistrationForm, type RegisterFormValues } from '@/src/utils/validators';

function base(): RegisterFormValues {
  return {
    first_name: 'Maria', last_name: 'Garcia', email: 'user@example.com',
    phone: '', password: 'Test1234#', confirmPassword: 'Test1234#',
  };
}

describe('maxLength validation', () => {
  it('should reject first_name longer than 50 characters', () => {
    const errors = validateRegistrationForm({ ...base(), first_name: 'A'.repeat(51) });
    expect(errors.some((e) => e.field === 'first_name')).toBe(true);
  });

  it('should reject last_name longer than 50 characters', () => {
    const errors = validateRegistrationForm({ ...base(), last_name: 'A'.repeat(51) });
    expect(errors.some((e) => e.field === 'last_name')).toBe(true);
  });

  it('should reject email longer than 150 characters', () => {
    const longEmail = 'a'.repeat(145) + '@b.com';
    const errors = validateRegistrationForm({ ...base(), email: longEmail });
    expect(errors.some((e) => e.field === 'email')).toBe(true);
  });

  it('should reject password longer than 255 characters', () => {
    const longPwd = 'Aa1#' + 'x'.repeat(252);
    const errors = validateRegistrationForm({ ...base(), password: longPwd, confirmPassword: longPwd });
    expect(errors.some((e) => e.field === 'password')).toBe(true);
  });
});
