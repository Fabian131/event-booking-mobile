import { validateRegistrationForm } from '@/src/utils/validators';

describe('multiple errors', () => {
  it('should return multiple errors at once for fully invalid form', () => {
    const errors = validateRegistrationForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: 'abc',
      password: '',
      confirmPassword: '',
    });

    expect(errors.length).toBeGreaterThanOrEqual(5);
    const fields = errors.map((e) => e.field);
    expect(fields).toContain('first_name');
    expect(fields).toContain('last_name');
    expect(fields).toContain('email');
    expect(fields).toContain('password');
    expect(fields).toContain('confirmPassword');
  });
});
