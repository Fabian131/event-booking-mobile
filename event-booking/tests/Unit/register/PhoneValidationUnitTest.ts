import { validateRegistrationForm, type RegisterFormValues } from '@/src/utils/validators';

function base(): RegisterFormValues {
  return {
    first_name: 'Maria', last_name: 'Garcia', email: 'user@example.com',
    phone: '', password: 'Test1234#', confirmPassword: 'Test1234#',
  };
}

describe('phone validation', () => {
  it('should accept empty phone', () => {
    const errors = validateRegistrationForm({ ...base(), phone: '' });
    expect(errors.filter((e) => e.field === 'phone')).toHaveLength(0);
  });

  it('should reject phone with letters', () => {
    const errors = validateRegistrationForm({ ...base(), phone: 'abc12345' });
    expect(errors.some((e) => e.field === 'phone')).toBe(true);
  });

  it('should reject phone with fewer than 8 digits', () => {
    const errors = validateRegistrationForm({ ...base(), phone: '1234567' });
    expect(errors.some((e) => e.field === 'phone')).toBe(true);
  });

  it('should reject phone with more than 8 digits', () => {
    const errors = validateRegistrationForm({ ...base(), phone: '123456789' });
    expect(errors.some((e) => e.field === 'phone')).toBe(true);
  });

  it('should accept valid 8-digit phone', () => {
    const errors = validateRegistrationForm({ ...base(), phone: '12345678' });
    expect(errors.filter((e) => e.field === 'phone')).toHaveLength(0);
  });
});
