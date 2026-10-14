import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smarthr_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smarthr_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('smarthr_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Session expired or invalid', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password, secretCode) => {
    const res = await api.post('/auth/login', { email, password, secretCode });
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('smarthr_token', newToken);
    localStorage.setItem('smarthr_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smarthr_token');
    localStorage.removeItem('smarthr_user');
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isViewer = user?.role === 'VIEWER';
  const canManageEmployees = isSuperAdmin;
  const canAccessSensitive = isSuperAdmin;
  const canManageSystem = isSuperAdmin;
  const updateUser = (updatedData) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('smarthr_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        isSuperAdmin,
        isViewer,
        canManageEmployees,
        canAccessSensitive,
        canManageSystem
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
