import { api } from './api';
import type { RegisterRequest, UserResponse, LoginRequest, LoginResponse } from '@/src/types/auth';

export const authService = {
  register(data: RegisterRequest): Promise<UserResponse> {
    return api.post<UserResponse>('/api/v1/auth/register', data);
  },

  login(data: LoginRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>('/api/v1/auth/login', data);
  },
};
