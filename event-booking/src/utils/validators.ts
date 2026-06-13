import type { FieldError } from '@/src/types/auth';
import { EVENT_CATEGORIES } from '@/src/types/events';
import { VALIDATION } from '@/src/constants/ui';

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
    errors.push({ field: 'email', message: VALIDATION.EMAIL_REQUIRED });
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.push({ field: 'email', message: VALIDATION.EMAIL_INVALID });
  }

  if (!values.password) {
    errors.push({ field: 'password', message: VALIDATION.PASSWORD_REQUIRED });
  }

  return errors;
}

export function validateRegistrationForm(values: RegisterFormValues): FieldError[] {
  const errors: FieldError[] = [];

  if (!values.first_name.trim()) {
    errors.push({ field: 'first_name', message: VALIDATION.FIRST_NAME_REQUIRED });
  } else if (values.first_name.trim().length < 2) {
    errors.push({ field: 'first_name', message: VALIDATION.FIRST_NAME_MIN });
  } else if (values.first_name.trim().length > 50) {
    errors.push({ field: 'first_name', message: VALIDATION.FIRST_NAME_MAX });
  } else if (!NAME_REGEX.test(values.first_name.trim())) {
    errors.push({ field: 'first_name', message: VALIDATION.FIRST_NAME_LETTERS });
  }

  if (!values.last_name.trim()) {
    errors.push({ field: 'last_name', message: VALIDATION.LAST_NAME_REQUIRED });
  } else if (values.last_name.trim().length < 2) {
    errors.push({ field: 'last_name', message: VALIDATION.LAST_NAME_MIN });
  } else if (values.last_name.trim().length > 50) {
    errors.push({ field: 'last_name', message: VALIDATION.LAST_NAME_MAX });
  } else if (!NAME_REGEX.test(values.last_name.trim())) {
    errors.push({ field: 'last_name', message: VALIDATION.LAST_NAME_LETTERS });
  }

  if (!values.email.trim()) {
    errors.push({ field: 'email', message: VALIDATION.EMAIL_REQUIRED });
  } else if (values.email.trim().length > 150) {
    errors.push({ field: 'email', message: VALIDATION.EMAIL_MAX });
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.push({ field: 'email', message: VALIDATION.EMAIL_INVALID });
  }

  if (values.phone.trim() && !PHONE_REGEX.test(values.phone.trim())) {
    errors.push({ field: 'phone', message: VALIDATION.PHONE_DIGITS });
  }

  if (!values.password) {
    errors.push({ field: 'password', message: VALIDATION.PASSWORD_REQUIRED });
  } else if (values.password.length < 8) {
    errors.push({ field: 'password', message: VALIDATION.PASSWORD_MIN });
  } else if (values.password.length > 255) {
    errors.push({ field: 'password', message: VALIDATION.PASSWORD_MAX });
  } else if (!PASSWORD_UPPER.test(values.password)) {
    errors.push({ field: 'password', message: VALIDATION.PASSWORD_UPPER });
  } else if (!PASSWORD_LOWER.test(values.password)) {
    errors.push({ field: 'password', message: VALIDATION.PASSWORD_LOWER });
  } else if (!PASSWORD_NUMBER.test(values.password)) {
    errors.push({ field: 'password', message: VALIDATION.PASSWORD_NUMBER });
  } else if (!PASSWORD_SPECIAL.test(values.password)) {
    errors.push({ field: 'password', message: VALIDATION.PASSWORD_SPECIAL });
  }

  if (!values.confirmPassword.trim()) {
    errors.push({ field: 'confirmPassword', message: VALIDATION.CONFIRM_REQUIRED });
  } else if (values.password !== values.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: VALIDATION.CONFIRM_MISMATCH });
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
    errors.push({ field: 'title', message: VALIDATION.TITLE_REQUIRED });
  } else if (values.title.trim().length < 3) {
    errors.push({ field: 'title', message: VALIDATION.TITLE_MIN });
  } else if (values.title.trim().length > 64) {
    errors.push({ field: 'title', message: VALIDATION.TITLE_MAX });
  }

  if (values.description.trim().length > 255) {
    errors.push({ field: 'description', message: VALIDATION.DESCRIPTION_MAX });
  }

  const capacity = parseInt(values.max_capacity, 10);
  if (!values.max_capacity.trim()) {
    errors.push({ field: 'max_capacity', message: VALIDATION.CAPACITY_REQUIRED });
  } else if (isNaN(capacity) || capacity < 1) {
    errors.push({ field: 'max_capacity', message: VALIDATION.CAPACITY_INVALID });
  } else if (capacity > 9999999) {
    errors.push({ field: 'max_capacity', message: VALIDATION.CAPACITY_MAX });
  }

  if (!values.category) {
    errors.push({ field: 'category', message: VALIDATION.CATEGORY_REQUIRED });
  } else if (!(EVENT_CATEGORIES as readonly string[]).includes(values.category)) {
    errors.push({ field: 'category', message: VALIDATION.CATEGORY_INVALID });
  }

  if (!values.date) {
    errors.push({ field: 'date', message: VALIDATION.DATE_REQUIRED });
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(values.date);
    eventDate.setHours(0, 0, 0, 0);
    if (eventDate < today) {
      errors.push({ field: 'date', message: VALIDATION.DATE_PAST });
    }
  }

  if (!values.start_time) {
    errors.push({ field: 'start_time', message: VALIDATION.START_REQUIRED });
  } else if (values.date) {
    const todayMid = new Date();
    todayMid.setHours(0, 0, 0, 0);
    const eventMid = new Date(values.date);
    eventMid.setHours(0, 0, 0, 0);
    if (eventMid.toDateString() === todayMid.toDateString()) {
      const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
      const startMins = values.start_time.getHours() * 60 + values.start_time.getMinutes();
      if (startMins <= nowMins) {
        errors.push({ field: 'start_time', message: VALIDATION.START_TIME_PAST });
      }
    }
  }

  if (!values.end_time) {
    errors.push({ field: 'end_time', message: VALIDATION.END_REQUIRED });
  }

  if (values.start_time && values.end_time) {
    const startMins = values.start_time.getHours() * 60 + values.start_time.getMinutes();
    const endMins = values.end_time.getHours() * 60 + values.end_time.getMinutes();
    if (endMins <= startMins) {
      errors.push({ field: 'end_time', message: VALIDATION.END_BEFORE_START });
    }
  }

  return errors;
}

const BACKEND_MESSAGE_MAP: Record<string, Record<string, string>> = {
  date: {
    'Event date cannot be in the past': VALIDATION.DATE_PAST,
  },
  start_time: {
    'Event start time cannot be in the past': VALIDATION.START_TIME_PAST,
  },
  end_time: {
    'end_time must be after start_time': VALIDATION.END_BEFORE_START,
  },
  title: {
    'Title must be at least 3 characters': VALIDATION.TITLE_MIN,
  },
  max_capacity: {
    'Capacity must be greater than 0': VALIDATION.CAPACITY_INVALID,
    'Capacity cannot exceed 9999999': VALIDATION.CAPACITY_MAX,
  },
};

export function mapServerErrors(details: FieldError[]): FieldError[] {
  return details.map((d) => ({
    ...d,
    message: BACKEND_MESSAGE_MAP[d.field]?.[d.message] ?? d.message,
  }));
}
