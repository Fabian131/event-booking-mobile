export type UserRole = 'business' | 'customer';

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface UserResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthenticatedUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ValidationError {
  error: string;
  message: string;
  details: FieldError[];
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthenticatedUser;
}

export type AuthUser = AuthenticatedUser;

export class ApiError extends Error {
  status: number;
  details?: FieldError[];

  constructor(message: string, status: number, details?: FieldError[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}
