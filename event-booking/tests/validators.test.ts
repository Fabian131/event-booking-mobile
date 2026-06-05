import { validateRegistrationForm, type RegisterFormValues } from '@/src/utils/validators';

function validValues(): RegisterFormValues {
  return {
    first_name: 'Maria',
    last_name: 'Garcia',
    email: 'user@example.com',
    phone: '',
    password: 'Test1234#',
    confirmPassword: 'Test1234#',
  };
}

describe('validateRegistrationForm', () => {
  it('should return no errors for valid input', () => {
    const errors = validateRegistrationForm(validValues());
    expect(errors).toHaveLength(0);
  });

  describe('first_name', () => {
    it('should reject empty first_name', () => {
      const errors = validateRegistrationForm({ ...validValues(), first_name: '' });
      expect(errors.some((e) => e.field === 'first_name')).toBe(true);
    });

    it('should reject first_name shorter than 2 characters', () => {
      const errors = validateRegistrationForm({ ...validValues(), first_name: 'A' });
      expect(errors.some((e) => e.field === 'first_name')).toBe(true);
    });

    it('should reject first_name with numbers', () => {
      const errors = validateRegistrationForm({ ...validValues(), first_name: 'J0hn' });
      expect(errors.some((e) => e.field === 'first_name')).toBe(true);
    });

    it('should accept first_name with hyphens and apostrophes', () => {
      const errors = validateRegistrationForm({ ...validValues(), first_name: "O'Connor-Smith" });
      expect(errors.filter((e) => e.field === 'first_name')).toHaveLength(0);
    });
  });

  describe('last_name', () => {
    it('should reject empty last_name', () => {
      const errors = validateRegistrationForm({ ...validValues(), last_name: '' });
      expect(errors.some((e) => e.field === 'last_name')).toBe(true);
    });

    it('should reject last_name shorter than 2 characters', () => {
      const errors = validateRegistrationForm({ ...validValues(), last_name: 'A' });
      expect(errors.some((e) => e.field === 'last_name')).toBe(true);
    });

    it('should reject last_name with numbers', () => {
      const errors = validateRegistrationForm({ ...validValues(), last_name: 'D0e' });
      expect(errors.some((e) => e.field === 'last_name')).toBe(true);
    });
  });

  describe('email', () => {
    it('should reject empty email', () => {
      const errors = validateRegistrationForm({ ...validValues(), email: '' });
      expect(errors.some((e) => e.field === 'email')).toBe(true);
    });

    it('should reject invalid email format', () => {
      const errors = validateRegistrationForm({ ...validValues(), email: 'notanemail' });
      expect(errors.some((e) => e.field === 'email')).toBe(true);
    });

    it('should reject email without domain', () => {
      const errors = validateRegistrationForm({ ...validValues(), email: 'user@' });
      expect(errors.some((e) => e.field === 'email')).toBe(true);
    });
  });

  describe('phone', () => {
    it('should accept empty phone', () => {
      const errors = validateRegistrationForm({ ...validValues(), phone: '' });
      expect(errors.filter((e) => e.field === 'phone')).toHaveLength(0);
    });

    it('should reject phone with letters', () => {
      const errors = validateRegistrationForm({ ...validValues(), phone: 'abc12345' });
      expect(errors.some((e) => e.field === 'phone')).toBe(true);
    });

    it('should reject phone with fewer than 8 digits', () => {
      const errors = validateRegistrationForm({ ...validValues(), phone: '1234567' });
      expect(errors.some((e) => e.field === 'phone')).toBe(true);
    });

    it('should reject phone with more than 8 digits', () => {
      const errors = validateRegistrationForm({ ...validValues(), phone: '123456789' });
      expect(errors.some((e) => e.field === 'phone')).toBe(true);
    });

    it('should accept valid 8-digit phone', () => {
      const errors = validateRegistrationForm({ ...validValues(), phone: '12345678' });
      expect(errors.filter((e) => e.field === 'phone')).toHaveLength(0);
    });
  });

  describe('password', () => {
    it('should reject empty password', () => {
      const errors = validateRegistrationForm({ ...validValues(), password: '', confirmPassword: '' });
      expect(errors.some((e) => e.field === 'password')).toBe(true);
    });

    it('should reject password shorter than 8 characters', () => {
      const errors = validateRegistrationForm({ ...validValues(), password: 'Ab1#', confirmPassword: 'Ab1#' });
      expect(errors.some((e) => e.field === 'password')).toBe(true);
    });

    it('should reject password without uppercase', () => {
      const errors = validateRegistrationForm({
        ...validValues(),
        password: 'test1234#',
        confirmPassword: 'test1234#',
      });
      expect(errors.some((e) => e.field === 'password')).toBe(true);
    });

    it('should reject password without lowercase', () => {
      const errors = validateRegistrationForm({
        ...validValues(),
        password: 'TEST1234#',
        confirmPassword: 'TEST1234#',
      });
      expect(errors.some((e) => e.field === 'password')).toBe(true);
    });

    it('should reject password without numbers', () => {
      const errors = validateRegistrationForm({
        ...validValues(),
        password: 'JohnDoeNoNumbers#',
        confirmPassword: 'JohnDoeNoNumbers#',
      });
      expect(errors.some((e) => e.field === 'password')).toBe(true);
    });

    it('should reject password without special character', () => {
      const errors = validateRegistrationForm({
        ...validValues(),
        password: 'Test12345',
        confirmPassword: 'Test12345',
      });
      expect(errors.some((e) => e.field === 'password')).toBe(true);
    });
  });

  describe('confirmPassword', () => {
    it('should reject empty confirmPassword', () => {
      const errors = validateRegistrationForm({ ...validValues(), confirmPassword: '' });
      expect(errors.some((e) => e.field === 'confirmPassword')).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const errors = validateRegistrationForm({
        ...validValues(),
        password: 'Test1234#',
        confirmPassword: 'WrongPass1#',
      });
      expect(errors.some((e) => e.field === 'confirmPassword')).toBe(true);
    });
  });

  it('should return multiple errors at once', () => {
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
