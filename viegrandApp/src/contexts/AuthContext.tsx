import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, storageUtils, User, LoginRequest, RegisterRequest, usersAPI } from '../services/api';
import { Alert } from 'react-native';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await storageUtils.getToken();
      const savedUser = await storageUtils.getUser();
      
      if (token && savedUser) {
        setUser(savedUser);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);
      
      // Kiểm tra response có đúng format không
      if (!response.access_token || !response.user) {
        throw new Error('Invalid response format');
      }
      
      // Lưu token và user info
      await storageUtils.saveToken(response.access_token);
      await storageUtils.saveUser(response.user);
      
      setUser(response.user);
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Đăng nhập thất bại';
      
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join('\n');
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Lỗi', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      
      // Kiểm tra response có đúng format không
      if (!response.access_token || !response.user) {
        throw new Error('Invalid response format');
      }
      
      // Lưu token và user info
      await storageUtils.saveToken(response.access_token);
      await storageUtils.saveUser(response.user);
      
      setUser(response.user);
      return true;
    } catch (error: any) {
      console.error('Register error:', error);
      let errorMessage = 'Đăng ký thất bại';
      
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join('\n');
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Lỗi', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await storageUtils.clearAuth();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUserProfile = async (): Promise<void> => {
    try {
      const profile = await usersAPI.getProfile();
      setUser(profile);
      await storageUtils.saveUser(profile);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
