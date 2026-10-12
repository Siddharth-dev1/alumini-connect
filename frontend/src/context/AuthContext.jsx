import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('alumni_connect_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('alumni_connect_token');
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('alumni_connect_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Auth verification failed:', err);
          setUser(null);
          localStorage.removeItem('alumni_connect_token');
          localStorage.removeItem('alumni_connect_user');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchMe();
  }, []);

  const login = async (email, password, role) => {
    const res = await API.post('/auth/login', { email, password, role });
    const { token, ...userData } = res.data;
    localStorage.setItem('alumni_connect_token', token);
    localStorage.setItem('alumni_connect_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await API.post('/auth/register', formData);
    const { token, ...userData } = res.data;
    localStorage.setItem('alumni_connect_token', token);
    localStorage.setItem('alumni_connect_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('alumni_connect_token');
    localStorage.removeItem('alumni_connect_user');
    setUser(null);
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('alumni_connect_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
