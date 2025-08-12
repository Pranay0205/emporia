import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import TokenManager from '../utils/tokenManager';
import ApiClient from '../utils/apiClient';

interface User {
  id: string;
  user_name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  first_name: string;
  last_name: string;
  customer_id?: string;
  seller_id?: string;
  admin_id?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
}

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (TokenManager.isAuthenticated()) {
        const userData = TokenManager.getUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          
          // Verify token with server
          try {
            await ApiClient.verifyToken();
          } catch (error) {
            // Token is invalid, clear it
            logout();
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await ApiClient.login(credentials);
      
      TokenManager.setToken(response.access_token);
      TokenManager.setUser(response.user);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await ApiClient.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (TokenManager.isAuthenticated()) {
        await ApiClient.logout();
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      TokenManager.removeToken();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
