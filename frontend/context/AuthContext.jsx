import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('authUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('authToken') || null);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const nextToken = response.data?.token || null;
    const nextUser = response.data?.user || null;

    if (nextToken) {
      localStorage.setItem('authToken', nextToken);
      setToken(nextToken);
    }

    if (nextUser) {
      localStorage.setItem('authUser', JSON.stringify(nextUser));
      setUser(nextUser);
    }

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
  };

  const role = user?.role || null;

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      login,
      logout,
      isAuthenticated: Boolean(token && user),
    }),
    [user, token, role],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
