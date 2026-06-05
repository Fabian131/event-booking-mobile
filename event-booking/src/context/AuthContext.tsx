import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AuthUser, LoginRequest, RegisterRequest } from '@/src/types/auth';
import { authService } from '@/src/services/auth';
import { setToken } from '@/src/services/api';
import { storage } from '@/src/services/storage';

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (data: LoginRequest) => {
    const response = await authService.login(data);
    await setToken(response.access_token);
    setUser(response.user);
  };

  const register = async (data: RegisterRequest) => {
    await authService.register(data);
  };

  const logout = async () => {
    setUser(null);
    await setToken(null);
    await storage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
