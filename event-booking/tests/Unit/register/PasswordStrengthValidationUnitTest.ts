import { validateRegistrationForm, type RegisterFormValues } from '@/src/utils/validators';

function base(): RegisterFormValues {
  return {
    first_name: 'Maria', last_name: 'Garcia', email: 'user@example.com',
    phone: '', password: 'Test1234#', confirmPassword: 'Test1234#',
  };
}

describe('password strength validation', () => {
  it('should reject empty password', () => {
    const errors = validateRegistrationForm({ ...base(), password: '', confirmPassword: '' });
    expect(errors.some((e) => e.field === 'password')).toBe(true);
  });

  it('should reject password shorter than 8 characters', () => {
    const errors = validateRegistrationForm({ ...base(), password: 'Ab1#', confirmPassword: 'Ab1#' });
    expect(errors.some((e) => e.field === 'password')).toBe(true);
  });

  it('should reject password without uppercase', () => {
    const errors = validateRegistrationForm({ ...base(), password: 'test1234#', confirmPassword: 'test1234#' });
    expect(errors.some((e) => e.field === 'password')).toBe(true);
  });

  it('should reject password without lowercase', () => {
    const errors = validateRegistrationForm({ ...base(), password: 'TEST1234#', confirmPassword: 'TEST1234#' });
    expect(errors.some((e) => e.field === 'password')).toBe(true);
  });

  it('should reject password without numbers', () => {
    const errors = validateRegistrationForm({ ...base(), password: 'JohnDoeNoNumbers#', confirmPassword: 'JohnDoeNoNumbers#' });
    expect(errors.some((e) => e.field === 'password')).toBe(true);
  });

  it('should reject password without special character', () => {
    const errors = validateRegistrationForm({ ...base(), password: 'Test12345', confirmPassword: 'Test12345' });
    expect(errors.some((e) => e.field === 'password')).toBe(true);
  });
});
