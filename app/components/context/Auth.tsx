"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string
  username: string
  email: string
  profile: any
}

export interface AuthContextType {
  user: User | null;
  login: (formData: { username: string; password: string }) => Promise<any>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('user');
    }
  }, []);

  const login = async (formData: {username: string, password: string}) => {
    try {
      const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
      let errorMsg = 'Sign in failed';
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorData.details || errorMsg;
      } catch {
        //  errorMsg = 'Sign in failed. Please try again.';
      }
      return errorMsg;
      }

      const data = await response.json();
      console.log('Login response:', data.data.user);

      if (!data.data.user) {
      return 'Invalid response from server.';
      }
      
      setUser(data.data.user);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return null;
    } catch (error: any) {
      if (error instanceof TypeError) {
      return 'Network error. Please check your connection.';
      }
      return error?.message || 'An unexpected error occurred.';
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
