import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser, LoginRequest, RegisterRequest, UserRole } from '@/src/types/auth';
import { authService } from '@/src/services/auth';
import { setToken } from '@/src/services/api';
import { storage } from '@/src/services/storage';

const AUTH_USER_KEY = 'auth_user';

type AuthStatus = 'loading' | 'guest' | UserRole;

type AuthContextType = {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isBusiness: boolean;
  isGuest: boolean;
  isLoading: boolean;
  isRestoring: boolean;
  login: (data: LoginRequest) => Promise<AuthUser>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') return false;

  const user = value as Partial<AuthUser>;

  return (
    typeof user.id === 'string' &&
    typeof user.first_name === 'string' &&
    typeof user.last_name === 'string' &&
    typeof user.email === 'string' &&
    (user.role === 'business' || user.role === 'customer')
  );
}

async function clearStoredSession() {
  await setToken(null);
  await storage.remove(AUTH_USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const [storedToken, storedUser] = await Promise.all([
          storage.get('auth_token'),
          storage.get(AUTH_USER_KEY),
        ]);

        if (!storedToken || !storedUser) {
          await clearStoredSession();

          if (mounted) {
            setUser(null);
            setStatus('guest');
          }

          return;
        }

        const parsedUser: unknown = JSON.parse(storedUser);

        if (!isAuthUser(parsedUser)) {
          await clearStoredSession();

          if (mounted) {
            setUser(null);
            setStatus('guest');
          }

          return;
        }

        await setToken(storedToken);

        if (mounted) {
          setUser(parsedUser);
          setStatus(parsedUser.role);
        }
      } catch {
        await clearStoredSession();

        if (mounted) {
          setUser(null);
          setStatus('guest');
        }
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await authService.login(data);

    try {
      await setToken(response.access_token);
      await storage.set(AUTH_USER_KEY, JSON.stringify(response.user));
    } catch (err) {
      await clearStoredSession();
      throw err;
    }

    setUser(response.user);
    setStatus(response.user.role);
    return response.user;
  };

  const register = async (data: RegisterRequest) => {
    await authService.register(data);
  };

  const logout = async () => {
    setUser(null);
    setStatus('guest');
    await clearStoredSession();
  };

  const isLoading = status === 'loading';
  const isGuest = status === 'guest';
  const isBusiness = status === 'business';
  const isAuthenticated = status === 'business' || status === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isAuthenticated,
        isBusiness,
        isGuest,
        isLoading,
        isRestoring: isLoading,
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
