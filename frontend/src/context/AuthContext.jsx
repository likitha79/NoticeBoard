import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getUserProfile } from '../services/api';
import useAuthHook from './useAuth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('pvpsit_user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('pvpsit_user_token') || null;
  });
  const [loading, setLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('pvpsit_user_token');
      if (savedToken) {
        try {
          const res = await getUserProfile();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('pvpsit_user_data', JSON.stringify(res.data));
          }
        } catch (error) {
          // Token is expired or DB was reset, clear stale credentials silently
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await loginUser(email, password);
      if (res.success && res.data) {
        const { token: jwtToken, ...userData } = res.data;
        setToken(jwtToken);
        setUser(userData);
        localStorage.setItem('pvpsit_user_token', jwtToken);
        localStorage.setItem('pvpsit_user_data', JSON.stringify(userData));
        return { success: true, data: userData };
      }
      return { success: false, message: res.message || 'Invalid email or password.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid email or password.',
      };
    }
  };

  const register = async (formData) => {
    try {
      const res = await registerUser(formData);
      if (res.success && res.data) {
        const { token: jwtToken, ...userData } = res.data;
        setToken(jwtToken);
        setUser(userData);
        localStorage.setItem('pvpsit_user_token', jwtToken);
        localStorage.setItem('pvpsit_user_data', JSON.stringify(userData));
        return { success: true, data: userData };
      }
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Please check your details.',
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pvpsit_user_token');
    localStorage.removeItem('pvpsit_user_data');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    department: user?.department || null,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = useAuthHook;
export default AuthProvider;
