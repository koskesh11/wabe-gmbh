import React, { createContext, useState, useEffect, useCallback } from 'react';
import { auth, isAuthenticated, clearAuth, getToken } from '../api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (isAuthenticated()) {
        try {
          const response = await auth.verify();
          setUser(response.data.user);
          setError(null);
        } catch (err) {
          clearAuth();
          setUser(null);
          setError('Session expired');
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await auth.login(email, password);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, name) => {
    setLoading(true);
    setError(null);
    try {
      const response = await auth.register(email, password, name);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
