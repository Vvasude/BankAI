import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('fraudDashboardToken');
      const storedUser = localStorage.getItem('fraudDashboardUser');
      
      if (token && storedUser) {
        try {
          const meResponse = await authApi.me();
          setUser({
            email: meResponse.email,
            name: meResponse.email.split('@')[0],
            role: 'Fraud Analyst'
          });
        } catch (error) {
          localStorage.removeItem('fraudDashboardToken');
          localStorage.removeItem('fraudDashboardUser');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    
    try {
      const response = await authApi.login(email, password);
      
      localStorage.setItem('fraudDashboardToken', response.token);
      
      const userData = {
        email: response.email,
        name: response.email.split('@')[0],
        role: 'Fraud Analyst'
      };
      
      setUser(userData);
      localStorage.setItem('fraudDashboardUser', JSON.stringify(userData));
      setIsLoading(false);
      
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      const message = error.response?.data?.message || error.response?.data || 'Invalid credentials';
      return { success: false, error: message };
    }
  };

  const register = async (email, password, name) => {
    setIsLoading(true);
    
    try {
      const response = await authApi.register(email, password, name);
      
      localStorage.setItem('fraudDashboardToken', response.token);
      
      const userData = {
        email: response.email,
        name: name || response.email.split('@')[0],
        role: 'Fraud Analyst'
      };
      
      setUser(userData);
      localStorage.setItem('fraudDashboardUser', JSON.stringify(userData));
      setIsLoading(false);
      
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      const message = error.response?.data?.message || error.response?.data || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fraudDashboardToken');
    localStorage.removeItem('fraudDashboardUser');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
