import type { FieldError } from '@/src/types/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-']+$/;
const PASSWORD_UPPER = /[A-Z]/;
const PASSWORD_LOWER = /[a-z]/;
const PASSWORD_NUMBER = /[0-9]/;
const PASSWORD_SPECIAL = /[!@#$%^&*(),.?":{}|<>\-_+=\[\]\/\\]/;
const PHONE_REGEX = /^\d{8}$/;

export interface RegisterFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export function validateRegistrationForm(values: RegisterFormValues): FieldError[] {
  const errors: FieldError[] = [];

  if (!values.first_name.trim()) {
    errors.push({ field: 'first_name', message: 'El nombre es obligatorio' });
  } else if (values.first_name.trim().length < 2) {
    errors.push({ field: 'first_name', message: 'El nombre debe tener al menos 2 caracteres' });
  } else if (values.first_name.trim().length > 50) {
    errors.push({ field: 'first_name', message: 'El nombre no puede exceder 50 caracteres' });
  } else if (!NAME_REGEX.test(values.first_name.trim())) {
    errors.push({ field: 'first_name', message: 'El nombre solo puede contener letras' });
  }

  if (!values.last_name.trim()) {
    errors.push({ field: 'last_name', message: 'El apellido es obligatorio' });
  } else if (values.last_name.trim().length < 2) {
    errors.push({ field: 'last_name', message: 'El apellido debe tener al menos 2 caracteres' });
  } else if (values.last_name.trim().length > 50) {
    errors.push({ field: 'last_name', message: 'El apellido no puede exceder 50 caracteres' });
  } else if (!NAME_REGEX.test(values.last_name.trim())) {
    errors.push({ field: 'last_name', message: 'El apellido solo puede contener letras' });
  }

  if (!values.email.trim()) {
    errors.push({ field: 'email', message: 'El correo electrónico es obligatorio' });
  } else if (values.email.trim().length > 150) {
    errors.push({ field: 'email', message: 'El correo no puede exceder 150 caracteres' });
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.push({ field: 'email', message: 'Ingresa un correo electrónico válido' });
  }

  if (values.phone.trim() && !PHONE_REGEX.test(values.phone.trim())) {
    errors.push({ field: 'phone', message: 'El teléfono debe tener exactamente 8 dígitos' });
  }

  if (!values.password) {
    errors.push({ field: 'password', message: 'La contraseña es obligatoria' });
  } else if (values.password.length < 8) {
    errors.push({ field: 'password', message: 'La contraseña debe tener al menos 8 caracteres' });
  } else if (values.password.length > 255) {
    errors.push({ field: 'password', message: 'La contraseña no puede exceder 255 caracteres' });
  } else if (!PASSWORD_UPPER.test(values.password)) {
    errors.push({ field: 'password', message: 'La contraseña debe contener al menos una mayúscula' });
  } else if (!PASSWORD_LOWER.test(values.password)) {
    errors.push({ field: 'password', message: 'La contraseña debe contener al menos una minúscula' });
  } else if (!PASSWORD_NUMBER.test(values.password)) {
    errors.push({ field: 'password', message: 'La contraseña debe contener al menos un número' });
  } else if (!PASSWORD_SPECIAL.test(values.password)) {
    errors.push({ field: 'password', message: 'La contraseña debe contener al menos un carácter especial' });
  }

  if (!values.confirmPassword.trim()) {
    errors.push({ field: 'confirmPassword', message: 'Confirma tu contraseña' });
  } else if (values.password !== values.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Las contraseñas no coinciden' });
  }

  return errors;
}
