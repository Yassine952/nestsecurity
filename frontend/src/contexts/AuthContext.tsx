'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: number;
  email: string;
  roles: Array<{ name: string }>;
  verified: boolean;
  isTwoFactorEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; requires2fa?: boolean; message?: string }>;
  logout: () => void;
  register: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message?: string }>;
  verifyTwoFactor: (code: string) => Promise<{ success: boolean; message?: string }>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await authApi.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const { access_token, requires_2fa } = response.data;
      
      if (requires_2fa) {
        // Store temporary token for 2FA verification
        localStorage.setItem('temp_token', access_token);
        return { success: true, requires2fa: true };
      }
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      await fetchUserProfile(access_token);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await authApi.register({ email, password });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const response = await authApi.verifyEmail(token);
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Email verification failed' 
      };
    }
  };

  const verifyTwoFactor = async (code: string) => {
    try {
      const response = await authApi.verifyTwoFactor(code);
      const { access_token } = response.data;
      
      localStorage.removeItem('temp_token');
      localStorage.setItem('token', access_token);
      setToken(access_token);
      await fetchUserProfile(access_token);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || '2FA verification failed' 
      };
    }
  };

  const refreshProfile = async () => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      await fetchUserProfile(savedToken);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('temp_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    register,
    verifyEmail,
    verifyTwoFactor,
    refreshProfile,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 