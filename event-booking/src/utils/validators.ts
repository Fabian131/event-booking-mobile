import type { FieldError } from '@/src/types/auth';
import { EVENT_CATEGORIES } from '@/src/types/event';

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

export interface LoginFormValues {
  email: string;
  password: string;
}

export function validateLoginForm(values: LoginFormValues): FieldError[] {
  const errors: FieldError[] = [];

  if (!values.email.trim()) {
    errors.push({ field: 'email', message: 'El correo electrónico es obligatorio' });
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.push({ field: 'email', message: 'Ingresa un correo electrónico válido' });
  }

  if (!values.password) {
    errors.push({ field: 'password', message: 'La contraseña es obligatoria' });
  }

  return errors;
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

export interface CreateEventFormValues {
  title: string;
  description: string;
  max_capacity: string;
  category: string;
  date: Date | null;
  start_time: Date | null;
  end_time: Date | null;
  image: string | null;
}

export function validateCreateEventForm(values: CreateEventFormValues): FieldError[] {
  const errors: FieldError[] = [];

  if (!values.title.trim()) {
    errors.push({ field: 'title', message: 'El título es obligatorio' });
  } else if (values.title.trim().length < 3) {
    errors.push({ field: 'title', message: 'El título debe tener al menos 3 caracteres' });
  } else if (values.title.trim().length > 64) {
    errors.push({ field: 'title', message: 'El título no puede exceder 64 caracteres' });
  }

  if (values.description.trim().length > 255) {
    errors.push({ field: 'description', message: 'La descripción no puede exceder 255 caracteres' });
  }

  const capacity = parseInt(values.max_capacity, 10);
  if (!values.max_capacity.trim()) {
    errors.push({ field: 'max_capacity', message: 'La capacidad máxima es obligatoria' });
  } else if (isNaN(capacity) || capacity < 1) {
    errors.push({ field: 'max_capacity', message: 'La capacidad debe ser al menos 1' });
  } else if (capacity > 9999999) {
    errors.push({ field: 'max_capacity', message: 'La capacidad no puede exceder 9999999' });
  }

  if (!values.category) {
    errors.push({ field: 'category', message: 'La categoría es obligatoria' });
  } else if (!(EVENT_CATEGORIES as readonly string[]).includes(values.category)) {
    errors.push({ field: 'category', message: 'La categoría seleccionada no es válida' });
  }

  if (!values.date) {
    errors.push({ field: 'date', message: 'La fecha es obligatoria' });
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(values.date);
    eventDate.setHours(0, 0, 0, 0);
    if (eventDate < today) {
      errors.push({ field: 'date', message: 'La fecha no puede ser en el pasado' });
    }
  }

  if (!values.start_time) {
    errors.push({ field: 'start_time', message: 'La hora de inicio es obligatoria' });
  }

  if (!values.end_time) {
    errors.push({ field: 'end_time', message: 'La hora de fin es obligatoria' });
  }

  if (values.start_time && values.end_time) {
    const startMins = values.start_time.getHours() * 60 + values.start_time.getMinutes();
    const endMins = values.end_time.getHours() * 60 + values.end_time.getMinutes();
    if (endMins <= startMins) {
      errors.push({ field: 'end_time', message: 'La hora de fin debe ser posterior a la de inicio' });
    }
  }

  return errors;
}
