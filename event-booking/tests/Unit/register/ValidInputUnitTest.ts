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

describe('valid register input', () => {
  it('should return no errors for valid input', () => {
    const errors = validateRegistrationForm(validValues());
    expect(errors).toHaveLength(0);
  });
});
