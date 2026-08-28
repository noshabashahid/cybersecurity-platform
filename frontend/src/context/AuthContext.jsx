import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { extractErrorMessage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cs_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const persist = (token, userObj) => {
    localStorage.setItem('cs_token', token);
    localStorage.setItem('cs_user', JSON.stringify(userObj));
    setUser(userObj);
  };

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem('cs_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('cs_user', JSON.stringify(res.data.user));
    } catch {
      localStorage.removeItem('cs_token');
      localStorage.removeItem('cs_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      persist(res.data.token, res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, message: extractErrorMessage(err, 'Login failed.') };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const res = await api.post('/auth/admin-login', { email, password });
      persist(res.data.token, res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: extractErrorMessage(err, 'Admin login failed.') };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      persist(res.data.token, res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: extractErrorMessage(err, 'Registration failed.'), errors: err?.response?.data?.errors };
    }
  };

  const logout = () => {
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, adminLogin, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}