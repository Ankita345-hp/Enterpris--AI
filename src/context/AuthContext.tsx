import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { User, UserRole } from '../shared/types.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; department: string; role?: UserRole }) => Promise<void>;
  logout: () => void;
  quickLogin: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('enterprise_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('enterprise_token');
      if (storedToken) {
        try {
          const res = await api.get('/users/profile');
          setUser(res.data);
        } catch (err) {
          console.warn('Failed to load user profile with stored token:', err);
          localStorage.removeItem('enterprise_token');
          localStorage.removeItem('enterprise_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('enterprise_token', receivedToken);
    localStorage.setItem('enterprise_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
  };

  const signup = async (data: { name: string; email: string; password: string; department: string; role?: UserRole }) => {
    const res = await api.post('/auth/signup', data);
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('enterprise_token', receivedToken);
    localStorage.setItem('enterprise_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
  };

  const logout = () => {
    localStorage.removeItem('enterprise_token');
    localStorage.removeItem('enterprise_user');
    setToken(null);
    setUser(null);
  };

  const quickLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        isManager,
        login,
        signup,
        logout,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
