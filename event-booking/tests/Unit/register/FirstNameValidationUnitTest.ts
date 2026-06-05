import { validateRegistrationForm, type RegisterFormValues } from '@/src/utils/validators';

function base(): RegisterFormValues {
  return {
    first_name: 'Maria', last_name: 'Garcia', email: 'user@example.com',
    phone: '', password: 'Test1234#', confirmPassword: 'Test1234#',
  };
}

describe('first name validation', () => {
  it('should reject empty first_name', () => {
    const errors = validateRegistrationForm({ ...base(), first_name: '' });
    expect(errors.some((e) => e.field === 'first_name')).toBe(true);
  });

  it('should reject first_name shorter than 2 characters', () => {
    const errors = validateRegistrationForm({ ...base(), first_name: 'A' });
    expect(errors.some((e) => e.field === 'first_name')).toBe(true);
  });

  it('should reject first_name with numbers', () => {
    const errors = validateRegistrationForm({ ...base(), first_name: 'J0hn' });
    expect(errors.some((e) => e.field === 'first_name')).toBe(true);
  });

  it('should accept first_name with hyphens and apostrophes', () => {
    const errors = validateRegistrationForm({ ...base(), first_name: "O'Connor-Smith" });
    expect(errors.filter((e) => e.field === 'first_name')).toHaveLength(0);
  });
});
