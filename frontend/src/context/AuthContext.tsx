import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient, AuthContextType, RegisterData } from '../types';
import apiService from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedToken = localStorage.getItem('token');
    const storedPatient = localStorage.getItem('patient');

    if (storedToken && storedPatient) {
      setToken(storedToken);
      setPatient(JSON.parse(storedPatient));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiService.login(email, password);
      if (response.success && response.data) {
        const { token: newToken, patient: newPatient } = response.data;
        setToken(newToken);
        setPatient(newPatient);
        localStorage.setItem('token', newToken);
        localStorage.setItem('patient', JSON.stringify(newPatient));
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      const response = await apiService.register(data);
      if (response.success && response.data) {
        const { token: newToken, patient: newPatient } = response.data;
        setToken(newToken);
        setPatient(newPatient);
        localStorage.setItem('token', newToken);
        localStorage.setItem('patient', JSON.stringify(newPatient));
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Registration failed');
    }
  };

  const logout = (): void => {
    setToken(null);
    setPatient(null);
    localStorage.removeItem('token');
    localStorage.removeItem('patient');
  };

  const value: AuthContextType = {
    patient,
    token,
    isAuthenticated: !!token && !!patient,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
