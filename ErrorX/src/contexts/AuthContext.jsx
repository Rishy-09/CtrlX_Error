import { createContext, useContext, useState, useEffect } from 'react';
import { login, signup, logout } from '../api/authAPI';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token and validate it
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token and set user
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      // Implement token validation logic
      setLoading(false);
    } catch (error) {
      localStorage.removeItem('authToken');
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const data = await login(credentials);
      localStorage.setItem('authToken', data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleSignup = async (userData) => {
    try {
      const data = await signup(userData);
      localStorage.setItem('authToken', data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('authToken');
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthContext }